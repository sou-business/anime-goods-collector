import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductsRepository } from './ProductsRepository.js';
import { ProductModel } from '@/domain/model/ProductModel.js';
import * as productsTable from '@/infrastructure/db/productsTable.js';
import { Product } from '@prisma/client';

// productsTableモジュールをモック化
vi.mock('@/infrastructure/db/productsTable.js', () => ({
  findAllProducts: vi.fn(),
  createProducts: vi.fn(),
  deleteProducts: vi.fn(),
}));

describe('ProductsRepository', () => {
  let repository: ProductsRepository;

  beforeEach(() => {
    repository = new ProductsRepository();
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('商品一覧を取得できること', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          detail_url: 'https://example.com/product1',
          title: 'テスト商品1',
          price: 1000,
          image_url: 'https://example.com/image1.jpg',
        },
        {
          id: 2,
          detail_url: 'https://example.com/product2',
          title: 'テスト商品2',
          price: 2000,
          image_url: null,
        },
      ];

      vi.mocked(productsTable.findAllProducts).mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ProductModel);
      expect(result[0].title).toBe('テスト商品1');
      expect(result[0].price).toBe(1000);
      expect(result[0].detail_url).toBe('https://example.com/product1');
      expect(result[0].image_url).toBe('https://example.com/image1.jpg');

      expect(result[1].title).toBe('テスト商品2');
      expect(result[1].price).toBe(2000);
      expect(result[1].detail_url).toBe('https://example.com/product2');
      expect(result[1].image_url).toBeUndefined();

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
          detail_url: 'https://example.com/product',
          title: 'テスト商品',
          price: null,
          image_url: null,
        },
      ];

      vi.mocked(productsTable.findAllProducts).mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('テスト商品');
      expect(result[0].price).toBeUndefined();
      expect(result[0].detail_url).toBe('https://example.com/product');
      expect(result[0].image_url).toBeUndefined();
    });
  });

  describe('createProducts', () => {
    it('商品を作成できること', async () => {
      const products: ProductModel[] = [
        new ProductModel('商品1', 1000, 'https://example.com/1', 'https://example.com/img1.jpg'),
        new ProductModel('商品2', 2000, 'https://example.com/2'),
      ];

      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await repository.createProducts(products);

      expect(productsTable.createProducts).toHaveBeenCalledTimes(1);
      expect(productsTable.createProducts).toHaveBeenCalledWith([
        {
          detail_url: 'https://example.com/1',
          title: '商品1',
          price: 1000,
          image_url: 'https://example.com/img1.jpg',
        },
        {
          detail_url: 'https://example.com/2',
          title: '商品2',
          price: 2000,
          image_url: null,
        },
      ]);
    });

    it('空の配列を渡した場合でもエラーにならないこと', async () => {
      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await repository.createProducts([]);

      expect(productsTable.createProducts).toHaveBeenCalledTimes(1);
      expect(productsTable.createProducts).toHaveBeenCalledWith([]);
    });

    it('detail_urlが未指定の場合はエラーになること', async () => {
      const products: ProductModel[] = [
        new ProductModel('商品1', undefined, undefined, undefined),
      ];

      vi.mocked(productsTable.createProducts).mockResolvedValue(undefined);

      await expect(repository.createProducts(products)).rejects.toThrow('商品のdetail_urlが必須です: 商品1');
    });
  });

  describe('deleteAll', () => {
    it('すべての商品を削除できること', async () => {
      vi.mocked(productsTable.deleteProducts).mockResolvedValue(5);

      await repository.deleteAll();

      expect(productsTable.deleteProducts).toHaveBeenCalledTimes(1);
    });

    it('削除対象が0件の場合でもエラーにならないこと', async () => {
      vi.mocked(productsTable.deleteProducts).mockResolvedValue(0);

      await repository.deleteAll();

      expect(productsTable.deleteProducts).toHaveBeenCalledTimes(1);
    });
  });
});
