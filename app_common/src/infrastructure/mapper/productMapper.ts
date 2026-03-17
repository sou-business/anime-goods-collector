import { Product } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { ProductEntity, ProductProps } from '@/domain/entity/ProductEntity.js';

export function prismaToEntity(product: Product): ProductEntity {
    const props: ProductProps = {
        detailUrl: product.detailUrl,
        imageUrl: product.imageUrl,
        title: product.title,
        price: product.price,
    };
    return ProductEntity.reconstruct(props);
}

export function entityToPrismaInput(entity: ProductEntity): Prisma.ProductCreateManyInput {
    return {
        detailUrl: entity.detailUrl,
        imageUrl: entity.imageUrl,
        title: entity.title,
        price: entity.price,
    };
}

export function entitiesToCacheMap(entities: ProductEntity[]): Record<string, ProductEntity> {
    return Object.fromEntries(
        entities.map(entity => [entity.detailUrl, entity])
    );
}

export function cacheMapToEntities(productsMap: Record<string, unknown>): ProductEntity[] {
    return Object.values(productsMap)
        .map(v=> ProductEntity.reconstruct(v as ProductProps));
}