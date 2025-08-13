'use client';

import React, { useState, useEffect } from 'react';
import { ProductModel } from '@/domain/model/ProductModel';
import Product from '@/ui/components/Product';
import LoadingSpinner from '@/ui/components/LoadingSpinner';
import ErrorMessage from '@/ui/components/ErrorMessage';

const ProductsPage = () => {
    const [products, setProducts] = useState<ProductModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

   const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`商品データの取得に失敗しました (${response.status}: ${response.statusText})`);
            }
            
            const data = await response.json();
            
            // エラーレスポンスの場合
            if (data.error) {
                throw new Error(data.error);
            }
            
            // JSONデータをProductModelインスタンスに変換
            const productInstances = data.map((item: any) => 
                new ProductModel(item.title, item.price, item.detail_url, item.image_url)
            );
            
            setProducts(productInstances);
        } catch (err) {
            setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return <LoadingSpinner message="商品データを読み込み中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchProducts} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    商品一覧
                </h1>
                
                {products.length === 0 ? (
                    <div className="text-center">
                        <p className="text-gray-600 text-lg">商品が見つかりませんでした</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <Product key={index} product={product} />
                        ))}
                    </div>
                )}

                {/* デバッグ情報表示（開発時用） */}
                {process.env.NODE_ENV === 'development' && products.length > 0 && (
                    <div className="mt-12 bg-gray-800 text-white p-4 rounded">
                        <h3 className="text-lg font-semibold mb-3">デバッグ情報:</h3>
                        <pre className="text-sm overflow-x-auto">
                            {products.map((product, index) => (
                                <div key={index} className="mb-1">
                                    {index + 1}: {product.toString()}
                                </div>
                            ))}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;