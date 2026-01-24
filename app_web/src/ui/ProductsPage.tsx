'use client';

import React from 'react';
import Product from '@/ui/components/Product';
import LoadingSpinner from '@/ui/components/LoadingSpinner';
import ErrorMessage from '@/ui/components/ErrorMessage';
import { useProducts } from '@/ui/hooks/useProducts';

const ProductsPage = () => {
  const { products, loading, error, refetch } = useProducts();

  if (loading) return <LoadingSpinner message="商品データを読み込み中..." />;

  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">商品一覧</h1>

        {products.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 text-lg">商品が見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const key = (product as any).detailUrl || (product as any).id || (product as any).title;
              return <Product key={key ?? undefined} product={product} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;