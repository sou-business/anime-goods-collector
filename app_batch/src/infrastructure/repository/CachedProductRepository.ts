import { IProductRepository } from 'app_common';
import { CachedRepository } from '@/infrastructure/repository/CachedRepository.js';
import { ProductModel } from 'app_common';

export class CachedProductRepository extends CachedRepository<ProductModel> {
    private static readonly CACHE_KEY = "products";

    constructor(
        private readonly dbRepository: IProductRepository
    ) {
        super('CachedProductRepository');
    }

    async save(products: ProductModel[]): Promise<void> {
        // キャッシュを更新
        await this.setToCache(CachedProductRepository.CACHE_KEY, products);
    }
}