import { IProductRepository } from "@/domain/repository/IProductRepository.js";
import { ProductEntity } from "@/domain/entity/ProductEntity.js";
import { Prisma, Product } from "@prisma/client"
import { findAllProducts, createProducts} from "@/infrastructure/db/productsTable.js";
import { cacheGet, cacheMerge } from "@/infrastructure/cache/cacheService.js";
import { CACHE_KEYS } from "@/infrastructure/cache/sharedCacheKeys.js";
import { logger } from "@/utils/logger.js";
export class ProductsRepository implements IProductRepository {

  async findAll(): Promise<ProductEntity[]> {
    const productsFromCache = await this.findAllFromCache();
    if (productsFromCache.length !== 0) {
        return productsFromCache;
    }

    const products: Product[] = await findAllProducts();
    return products.map((product: Product) => new ProductEntity(
      product.detailUrl,
      product.imageUrl,
      product.title,
      product.price
    ));
  }

  async saveProducts(products: ProductEntity[]): Promise<void> {
    if (products.length === 0) return;
    const productData: Prisma.ProductCreateManyInput[] = products.map(product => ({
      detailUrl: product.detailUrl,
      imageUrl: product.imageUrl,
      title: product.title,
      price: product.price,
    }));

    await createProducts(productData);
    try {
        const productsMap = Object.fromEntries(
          products.map(product => [product.detailUrl, product])
        );
        await cacheMerge(CACHE_KEYS.PRODUCTS, productsMap);
    } catch (e) {
        logger.error('キャッシュの更新に失敗しました', e);
    }
  }

  private async findAllFromCache(): Promise<ProductEntity[]> {
    const productsMap = await cacheGet<Record<string, ProductEntity>>(CACHE_KEYS.PRODUCTS);
    if (!productsMap) return [];
    return Object.values(productsMap).map(product => new ProductEntity(
      product.detailUrl,
      product.imageUrl,
      product.title,
      product.price
    ));
  }
}