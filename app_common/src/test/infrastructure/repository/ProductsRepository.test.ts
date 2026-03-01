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
  cacheSet: vi.fn(),
}));

describe('ProductsRepository', () => {
  let repository: ProductsRepository;

  beforeEach(() => {
    vi.mocked(cacheService.cacheGet).mockResolvedValue(null); // デフォルトはキャッシュミス
    vi.mocked(cacheService.cacheSet).mockResolvedValue(undefined);
    repository = new ProductsRepository();
  });

  describe('findAll', () => {
    it('商品一覧を取得できること', async () => {
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
      expect(result[0]).toBeInstanceOf(ProductEntity);
      expect(result[0].title).toBe('テスト商品1');
      expect(result[0].price).toBe(1000);
      expect(result[0].detailUrl).toBe('https://example.com/product1');
      expect(result[0].imageUrl).toBe('https://example.com/image1.jpg');

      expect(result[1].title).toBe('テスト商品2');
      expect(result[1].price).toBe(2000);
      expect(result[1].detailUrl).toBe('https://example.com/product2');
      expect(result[1].imageUrl).toBeNull();

      expect(productsTable.findAllProducts).toHaveBeenCalledTimes(1);
    });

    it('空の配列を返すこと（商品がない場合）', async () => {
      vi.mocked(productsTable.findAllProducts).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
      expect(productsTable.findAllProducts).toHaveBeenCalledTimes(1);
    });

    it('null値が含まれる場合でも正しく変換されること', async () => {
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

    it('キャッシュにヒットした場合はDBを呼ばずキャッシュの内容を返すこと', async () => {
      const cachedProducts = [
        { id: 1, detailUrl: 'https://example.com/1', title: 'キャッシュ商品', imageUrl: null, price: 500 },
      ];
      vi.mocked(cacheService.cacheGet).mockResolvedValue(cachedProducts);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProductEntity);
      expect(result[0].title).toBe('キャッシュ商品');
      expect(result[0].price).toBe(500);
      expect(productsTable.findAllProducts).not.toHaveBeenCalled();
    });
  });

  describe('createProducts', () => {
    it('商品を作成できること', async () => {
      const products: ProductEntity[] = [
        new ProductEntity(null, 'https://example.com/1', '商品1', 'https://example.com/img1.jpg', 1000,),
        new ProductEntity(null, 'https://example.com/2', '商品2', null, 2000),
      ];

      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await repository.saveProducts(products);

      expect(productsTable.createProducts).toHaveBeenCalledTimes(1);
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
      expect(cacheService.cacheSet).toHaveBeenCalledWith(CACHE_KEYS.PRODUCTS, products);
    });

    it('空の配列を渡した場合は何もしないこと', async () => {
      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await repository.saveProducts([]);

      expect(productsTable.createProducts).toHaveBeenCalledTimes(0);
    });
  });
});
