import { IProductRepository } from '@/domain/repository/IProductRepository';
import { CachedRepository } from '@/infrastructure/repository/CachedRepository';
import { ProductModel } from   '@/domain/model/ProductModel';

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