import { NextResponse } from 'next/server';
import { logger, ProductEntity, ProductsRepository } from 'app_common/server';

export async function GET() {
    try {
        const repository = new ProductsRepository();
        const products: ProductEntity[] = await repository.findAll();
        if (products.length === 0) {
            return NextResponse.json({ message: '商品データがありません' }, { status: 200 });
        } else {
            return NextResponse.json(products);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
        logger.error(message, error);
        return NextResponse.json(
            { error: '商品データの取得に失敗しました' },
            { status: 500 }
        );
    }
}