import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductEntity } from 'app_common/server';

interface ProductProps {
    product: ProductEntity;
}

const Product: React.FC<ProductProps> = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {product.imageUrl && (
                <div className="relative w-full h-48">
                    <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.title}
                </h3>
                {product.price && (
                    <p className="text-xl font-bold text-blue-600 mb-3">
                        ¥{product.price.toLocaleString()}
                    </p>
                )}
                {product.detailUrl && (
                    <Link 
                        href={product.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                    >
                        詳細を見る
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Product;