import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductsRepository } from '@/infrastructure/repository/ProductsRepository.js';
import * as productsTable from '@/infrastructure/db/productsTable.js';
import * as cacheService from '@/infrastructure/cache/cacheService.js';
import { CACHE_KEYS } from '@/infrastructure/cache/sharedCacheKeys.js';
import { ProductEntity } from '@/domain/entity/ProductEntity.js';
import { Product } from '@prisma/client';

// productsTableモジュールをモック化
vi.mock('@/infrastructure/db/productsTable.js', () => ({
  findAllProducts: vi.fn(),
  createProducts: vi.fn(),
  deleteProducts: vi.fn(),
}));

// キャッシュをモック化（Redisに接続しないようにする）
vi.mock('@/infrastructure/cache/cacheService.js', () => ({
  cacheGet: vi.fn(),
  cacheMerge: vi.fn(),
}));

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ProductsRepository();
    vi.mocked(cacheService.cacheGet).mockResolvedValue(null);
    vi.mocked(cacheService.cacheMerge).mockResolvedValue(undefined);
  });
  
  describe('findAll', () => {
    it('キャッシュに商品データがある場合は、キャッシュの内容を返すこと', async () => {
      const cachedProductsMap: Record<string, ProductEntity> = {
        'https://example.com/1': new ProductEntity(
          1,
          'https://example.com/1',
          'キャッシュ商品',
          null,
          500,
        ),
      };
      vi.mocked(cacheService.cacheGet).mockResolvedValue(cachedProductsMap);
    
      const result = await repository.findAll();
    
      expect(cacheService.cacheGet).toHaveBeenCalledWith(CACHE_KEYS.PRODUCTS);
      expect(productsTable.findAllProducts).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProductEntity);
      expect(result[0].title).toBe('キャッシュ商品');
      expect(result[0].price).toBe(500);
    });
    
    it('キャッシュに商品データがない場合は、DBから商品一覧を取得できること', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          detailUrl: 'https://example.com/product1',
          title: 'テスト商品1',
          price: 1000,
          imageUrl: 'https://example.com/image1.jpg',
        },
        {
          id: 2,
          detailUrl: 'https://example.com/product2',
          title: 'テスト商品2',
          price: 2000,
          imageUrl: null,
        },
      ];

      vi.mocked(productsTable.findAllProducts).mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('テスト商品1');
      expect(result[0].price).toBe(1000);
      expect(result[0].detailUrl).toBe('https://example.com/product1');
      expect(result[0].imageUrl).toBe('https://example.com/image1.jpg');

      expect(result[1].title).toBe('テスト商品2');
      expect(result[1].price).toBe(2000);
      expect(result[1].detailUrl).toBe('https://example.com/product2');
      expect(result[1].imageUrl).toBeNull();
    });

    it('商品がない場合、空を返すこと', async () => {
      vi.mocked(productsTable.findAllProducts).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
      expect(productsTable.findAllProducts).toHaveBeenCalledTimes(1);
    });

    it('価格や画像が無くても商品を返すこと', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          detailUrl: 'https://example.com/product',
          title: 'テスト商品',
          price: null,
          imageUrl: null,
        },
      ];

      vi.mocked(productsTable.findAllProducts).mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('テスト商品');
      expect(result[0].price).toBeNull();
      expect(result[0].detailUrl).toBe('https://example.com/product');
      expect(result[0].imageUrl).toBeNull();
    });

  });

  describe('saveProducts', () => {
    it('商品データを保存できること', async () => {
      const products: ProductEntity[] = [
        new ProductEntity(null, 'https://example.com/1', '商品1', 'https://example.com/img1.jpg', 1000,),
        new ProductEntity(null, 'https://example.com/2', '商品2', null, 2000),
      ];

      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await repository.saveProducts(products);

      expect(productsTable.createProducts).toHaveBeenCalledWith([
        expect.objectContaining({
          detailUrl: 'https://example.com/1',
          title: '商品1',
          price: 1000
        }),
        expect.objectContaining({
          detailUrl: 'https://example.com/2',
          title: '商品2',
          price: 2000
        })
      ]);

      expect(cacheService.cacheMerge).toHaveBeenCalledTimes(1);
    });

    it('商品がすでにキャッシュに存在している場合も、既存の商品を残したまま新しい商品をキャッシュに追加できること', async () => {
      const cacheStore: Record<string, ProductEntity> = {
        'https://example.com/existing': new ProductEntity(
          1,
          'https://example.com/existing',
          '既存商品',
          null,
          500,
        ),
      };

      vi.mocked(cacheService.cacheMerge).mockImplementation(
        async (_key: string, value: Partial<Record<string, ProductEntity>>) => {
          Object.assign(cacheStore, value);
        },
      );

      const newProducts: ProductEntity[] = [
        new ProductEntity(
          null,
          'https://example.com/new',
          '新商品',
          'https://example.com/new.jpg',
          1000,
        ),
      ];

      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await repository.saveProducts(newProducts);

      expect(Object.keys(cacheStore)).toHaveLength(2);
      expect(cacheStore['https://example.com/existing']).toBeInstanceOf(ProductEntity);
      expect(cacheStore['https://example.com/existing'].title).toBe('既存商品');
      expect(cacheStore['https://example.com/new']).toBeInstanceOf(ProductEntity);
      expect(cacheStore['https://example.com/new'].title).toBe('新商品');
      expect(cacheService.cacheMerge).toHaveBeenCalledWith(
        CACHE_KEYS.PRODUCTS,
        expect.objectContaining({
          'https://example.com/new': expect.any(ProductEntity),
        }),
      );
    });

    it('商品データが空の場合は何もしないこと', async () => {
      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await repository.saveProducts([]);

      expect(productsTable.createProducts).toHaveBeenCalledTimes(0);
      expect(cacheService.cacheMerge).toHaveBeenCalledTimes(0);
    });
  });
});
