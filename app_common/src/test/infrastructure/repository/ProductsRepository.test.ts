import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { ProductsRepository } from '@/infrastructure/repository/ProductsRepository.js';
import * as productsTable from '@/infrastructure/db/productsTable.js';
import { CACHE_KEYS } from '@/infrastructure/cache/sharedCacheKeys.js';
import { ProductEntity } from '@/domain/entity/ProductEntity.js';
import { cacheGet, cacheSet, cacheDelete } from '@/utils/cacheClient.js';

const BASE_URL = 'https://example.com';

const PRODUCT_A = {
  productUrl: `${BASE_URL}/product1`,
  detailUrl: `${BASE_URL}/1`,
  imageUrl: `${BASE_URL}/img1.jpg`,
  title: '商品A',
  price: 1000,
} as const;

const PRODUCT_B = {
  productUrl: `${BASE_URL}/product2`,
  detailUrl: `${BASE_URL}/2`,
  imageUrl: `${BASE_URL}/img2.jpg`,
  title: '商品B',
  price: 2000,
} as const;

function findByDetailUrl<T extends { detailUrl: string }>(
  products: T[],
  detailUrl: string,
): T {
  const found = products.find((p) => p.detailUrl === detailUrl);
  if (!found) throw new Error(`商品が見つかりません: ${detailUrl}`);
  return found;
}

async function getProductsFromCache() {
  return cacheGet<Record<string, ProductEntity>>(CACHE_KEYS.PRODUCTS);
}

function expectProductMatch(
  actual: { detailUrl: string; imageUrl: string; title: string; price: number | null },
  expected: typeof PRODUCT_A | typeof PRODUCT_B
): void {
  expect(actual.detailUrl).toBe(expected.detailUrl);
  expect(actual.imageUrl).toBe(expected.imageUrl);
  expect(actual.title).toBe(expected.title);
  expect(actual.price).toBe(expected.price);
}

describe('ProductsRepository (integration)', () => {
  const repository = new ProductsRepository();

  beforeEach(async () => {
    await cacheDelete(CACHE_KEYS.PRODUCTS);
    await productsTable.deleteProducts();
  });

  afterAll(async () => {
    await cacheDelete(CACHE_KEYS.PRODUCTS);
    await productsTable.deleteProducts();
  });

  describe('findAll', () => {
    it('キャッシュに商品データがある場合は、キャッシュから商品一覧を取得できること', async () => {
      const cachedProductsMap = {
        [PRODUCT_A.detailUrl]: {
          detailUrl: PRODUCT_A.detailUrl,
          imageUrl: PRODUCT_A.imageUrl,
          title: PRODUCT_A.title,
          price: PRODUCT_A.price,
        },
      };
      await cacheSet(CACHE_KEYS.PRODUCTS, cachedProductsMap);

      const result: ProductEntity[] = await repository.findAll();

      expect(result).toHaveLength(1);
      expectProductMatch(result[0], PRODUCT_A);
    });

    it('キャッシュに商品データがない場合は、DBから商品一覧を取得できること', async () => {
      await productsTable.createProducts([
        {
          detailUrl: PRODUCT_A.detailUrl,
          imageUrl: PRODUCT_A.imageUrl,
          title: PRODUCT_A.title,
          price: PRODUCT_A.price,
        },
        {
          detailUrl: PRODUCT_B.detailUrl,
          imageUrl: PRODUCT_B.imageUrl,
          title: PRODUCT_B.title,
          price: PRODUCT_B.price,
        },
      ]);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expectProductMatch(findByDetailUrl(result, PRODUCT_A.detailUrl), PRODUCT_A);
      expectProductMatch(findByDetailUrl(result, PRODUCT_B.detailUrl), PRODUCT_B);
    });

    it('商品がない場合、空を返すこと', async () => {
      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('saveProducts', () => {
    it('商品データを保存できること', async () => {
      const products: ProductEntity[] = [
        new ProductEntity(PRODUCT_A.detailUrl, PRODUCT_A.imageUrl, PRODUCT_A.title, PRODUCT_A.price),
        new ProductEntity(PRODUCT_B.detailUrl, PRODUCT_B.imageUrl, PRODUCT_B.title, PRODUCT_B.price),
      ];

      await repository.saveProducts(products);

      const fromDb = await productsTable.findAllProducts();
      expect(fromDb).toHaveLength(2);
      expectProductMatch(findByDetailUrl(fromDb, PRODUCT_A.detailUrl), PRODUCT_A);
      expectProductMatch(findByDetailUrl(fromDb, PRODUCT_B.detailUrl), PRODUCT_B);

      const fromCache = await getProductsFromCache();
      expect(fromCache).not.toBeNull();
      expect(Object.keys(fromCache!).length).toBe(2);
      expectProductMatch(fromCache![PRODUCT_A.detailUrl], PRODUCT_A);
      expectProductMatch(fromCache![PRODUCT_B.detailUrl], PRODUCT_B);
    });

    it('商品がすでにキャッシュに存在している場合も、既存の商品を残したまま新しい商品をキャッシュに追加できること', async () => {
      const existingMap = {
        [PRODUCT_A.detailUrl]: {
          detailUrl: PRODUCT_A.detailUrl,
          imageUrl: PRODUCT_A.imageUrl,
          title: PRODUCT_A.title,
          price: PRODUCT_A.price,
        },
      };
      await cacheSet(CACHE_KEYS.PRODUCTS, existingMap);

      const newProducts: ProductEntity[] = [
        new ProductEntity(PRODUCT_B.detailUrl, PRODUCT_B.imageUrl, PRODUCT_B.title, PRODUCT_B.price),
      ];
      await repository.saveProducts(newProducts);

      const fromCache = await getProductsFromCache();
      expect(fromCache).not.toBeNull();
      expect(Object.keys(fromCache!).length).toBe(2);
      expectProductMatch(fromCache![PRODUCT_A.detailUrl], PRODUCT_A);
      expectProductMatch(fromCache![PRODUCT_B.detailUrl], PRODUCT_B);
    });

    it('商品データが空の場合は何もしないこと', async () => {
      await repository.saveProducts([]);

      const fromDb = await productsTable.findAllProducts();
      expect(fromDb).toHaveLength(0);

      const fromCache = await getProductsFromCache();
      expect(fromCache).toBeNull();
    });
  });
});