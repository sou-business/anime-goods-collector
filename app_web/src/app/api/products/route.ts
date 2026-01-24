import { NextResponse } from 'next/server';
import { findAllFromCache } from '@/infrastructure/repository/CachedProductRepository';
import { ProductModel, ProductsRepository } from 'app_common/server';

export async function GET() {
    try {
        const productsFromCache: ProductModel[] = await findAllFromCache();
        if (productsFromCache.length !== 0) {
            return NextResponse.json(productsFromCache);
        }
        
        const repository = new ProductsRepository();
        const productsFromDB: ProductModel[] = await repository.findAll();
        if (productsFromDB.length === 0) {
            return NextResponse.json({ message: '商品データが見つかりませんでした' }, { status: 404 });
        } else {
            return NextResponse.json(productsFromDB);
        }
    } catch (error) {
        return NextResponse.json(
            { error: '商品データの取得に失敗しました' },
            { status: 500 }
        );
    }
}