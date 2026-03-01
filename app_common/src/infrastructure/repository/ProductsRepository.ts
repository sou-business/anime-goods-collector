import { IProductRepository } from "@/domain/repository/IProductRepository.js";
import { ProductEntity } from "@/domain/entity/ProductEntity.js";
import { Prisma, Product } from "@prisma/client"
import { findAllProducts, createProducts} from "@/infrastructure/db/productsTable.js";
import { cacheGet, cacheSet } from "@/infrastructure/cache/cacheService.js";
import { CACHE_KEYS } from "@/infrastructure/cache/sharedCacheKeys.js";
import { logger } from "@/utils/logger.js";
export class ProductsRepository implements IProductRepository {

  async findAll(): Promise<ProductEntity[]> {
    const productsFromCache = await this.findAllFromCache();
    if (productsFromCache.length !== 0) {
        return productsFromCache;
    }

    const products: Product[] = await findAllProducts();
    return products.map(product => new ProductEntity(
      product.id,
      product.detailUrl,
      product.title,
      product.imageUrl ?? null,
      product.price ?? null
    ));
  }

  async saveProducts(products: ProductEntity[]): Promise<void> {
    if (products.length === 0) return;

    const productData: Prisma.ProductCreateManyInput[] = products.map(product => ({
      detailUrl: product.detailUrl,
      title: product.title,
      price: product.price ?? null,
      imageUrl: product.imageUrl ?? null,
    }));

    await createProducts(productData);
    try {
        await cacheSet(CACHE_KEYS.PRODUCTS, products);
    } catch (e) {
        logger.error('キャッシュの更新に失敗しました', e);
    }
  }

  private async findAllFromCache(): Promise<ProductEntity[]> {
    const products = await cacheGet<ProductEntity[]>(CACHE_KEYS.PRODUCTS);
    if (!products) return [];
    return products.map(product => new ProductEntity(
        product.id,
        product.detailUrl,
        product.title,
        product.imageUrl,
        product.price
      ));
  }
}