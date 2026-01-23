import { Prisma, Product } from '@prisma/client';
import { prismaClient } from '@/infrastructure/db/prisma.js';

export async function findAllProducts(): Promise<Product[]>  {
  const products:Product[] = await prismaClient.product.findMany();
  return products;
}

export async function createProducts(products: Prisma.ProductCreateInput[]): Promise<void> {
  await prismaClient.product.createMany({
    data: products,
    skipDuplicates: true,
  });
}

export async function deleteProducts(): Promise<number> {
  const result = await prismaClient.product.deleteMany({ where: {} });
  return result.count;
};