import { IProductRepository } from 'app_common';
import { ProductModel } from   'app_common';
import { CachedRepository } from '@/infrastructure/repository/CachedRepository';

export class CachedProductRepository extends CachedRepository<ProductModel> {
    private static readonly CACHE_KEY = "products";

    constructor(
        private readonly dbRepository: IProductRepository
    ) {
        super('CachedProductRepository');
    }

    async findAll(): Promise<ProductModel[]> {
        // キャッシュから取得を試行
        const cached = await this.getFromCache<ProductModel[]>(CachedProductRepository.CACHE_KEY);
        if (cached) {
            return cached;
        }

        // DBから取得してキャッシュに保存
        const ProductModels = await this.dbRepository.findAll();
        await this.setToCache(CachedProductRepository.CACHE_KEY, ProductModels);
        return ProductModels;
    }

    async save(products: ProductModel[]): Promise<void> {
        // キャッシュを更新
        await this.setToCache(CachedProductRepository.CACHE_KEY, products);
    }
}