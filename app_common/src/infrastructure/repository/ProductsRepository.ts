import { Prisma, Product } from "@prisma/client"
import { IProductRepository } from "@/domain/repository/IProductRepository.js";
import { ProductEntity } from "@/domain/entity/ProductEntity.js";
import { findAllProducts, createProducts } from "@/infrastructure/db/productsTable.js";
import { CACHE_KEYS } from "@/infrastructure/cache/sharedCacheKeys.js";
import { cacheGet, cacheMerge } from "@/utils/cacheClient.js";
import { logger } from '@/utils/logger.js';


export class ProductsRepository implements IProductRepository {

  async findAll(): Promise<ProductEntity[]> {
      const productsFromCache = await this.findAllFromCache();
      if (productsFromCache !== null && productsFromCache.length !== 0) {
          return productsFromCache;
      }
      try {
          const products: Product[] = await findAllProducts();
          return products.map(ProductEntity.reconstruct);
      } catch (e) {
          logger.error('DB取得に失敗しました', e);
          return [];
      }
  }

  async saveProducts(products: ProductEntity[]): Promise<void> {
    if (products.length === 0) return;
    const productData: Prisma.ProductCreateManyInput[] = products.map(ProductEntity.reconstruct);

    try {
        await createProducts(productData);
    } catch (e) {
        logger.error('DB保存に失敗しました', e);
    }

    try {
      const productsMap = Object.fromEntries(
        products.map(product => [product.detailUrl, product])
      );
      await cacheMerge(CACHE_KEYS.PRODUCTS, productsMap);
    } catch (e) {
        logger.error('キャッシュの更新に失敗しました', e);
    }
  }

  private async findAllFromCache(): Promise<ProductEntity[] | null> {
    try {
        const productsMap = await cacheGet<Record<string, ProductEntity>>(CACHE_KEYS.PRODUCTS);
        if (!productsMap) return null;
        return Object.values(productsMap).map(ProductEntity.reconstruct);
    } catch (e) {
        logger.error('キャッシュ取得に失敗しました', e);
        return null;
    }
  }
}