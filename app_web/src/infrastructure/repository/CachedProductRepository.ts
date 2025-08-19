import { 
    ProductModel,
    cacheGet,
    CACHE_KEYS,
 } from 'app_common';

export async function findAllFromCache(): Promise<ProductModel[]> {
    // キャッシュから取得
    const products = await cacheGet<ProductModel[]>(CACHE_KEYS.PRODUCTS);
    return products ?? [];
}