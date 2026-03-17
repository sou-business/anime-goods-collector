import { Product } from "@prisma/client"
import { ProductEntity } from "@/domain/entity/ProductEntity.js";
import { IProductRepository } from "@/domain/repository/IProductRepository.js";
import { findAllProducts, createProducts } from "@/infrastructure/db/productsTable.js";
import { CACHE_KEYS } from "@/infrastructure/cache/sharedCacheKeys.js";
import { prismaToEntity, entityToPrismaInput, entitiesToCacheMap, cacheMapToEntities } from "@/infrastructure/mapper/productMapper.js";
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
          return products.map(prismaToEntity);
      } catch (e) {
          logger.error('DB取得に失敗しました', e);
          return [];
      }
  }

  async saveProducts(products: ProductEntity[]): Promise<void> {
    if (products.length === 0) return;
    try {
        await createProducts(products.map(entityToPrismaInput));
    } catch (e) {
        logger.error('DB保存に失敗しました', e);
    }

    try {
      await cacheMerge(CACHE_KEYS.PRODUCTS, entitiesToCacheMap(products));
    } catch (e) {
        logger.error('キャッシュの更新に失敗しました', e);
    }
  }

  private async findAllFromCache(): Promise<ProductEntity[] | null> {
    try {
        const productsMap = await cacheGet<Record<string, ProductEntity>>(CACHE_KEYS.PRODUCTS);
        if (!productsMap) return null;
        return cacheMapToEntities(productsMap);
    } catch (e) {
        logger.error('キャッシュ取得に失敗しました', e);
        return null;
    }
  }
}