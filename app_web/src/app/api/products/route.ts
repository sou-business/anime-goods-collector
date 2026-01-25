import { NextResponse } from 'next/server';
import { findAllFromCache } from '@/infrastructure/repository/CachedProductRepository';
import { logger, ProductModel, ProductsRepository } from 'app_common/server';

export async function GET() {
    try {
        const productsFromCache: ProductModel[] = await findAllFromCache();
        if (productsFromCache.length !== 0) {
            return NextResponse.json(productsFromCache);
        }
        
        const repository = new ProductsRepository();
        const productsFromDB: ProductModel[] = await repository.findAll();
        if (productsFromDB.length === 0) {
            return NextResponse.json({ message: '商品データがありません' }, { status: 200 });
        } else {
            return NextResponse.json(productsFromDB);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
        logger.error(message, error, 'Failed to fetch products');
        return NextResponse.json(
            { error: '商品データの取得に失敗しました' },
            { status: 500 }
        );
    }
}