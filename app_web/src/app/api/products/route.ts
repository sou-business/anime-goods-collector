// /src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findAllProducts } from '../../../infrastructure/db/productsTable';

export async function GET(request: NextRequest) {
    try {
        const products = await findAllProducts();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json(
            { error: '商品データの取得に失敗しました' },
            { status: 500 }
        );
    }
}