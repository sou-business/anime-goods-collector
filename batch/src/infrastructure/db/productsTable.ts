import { Prisma } from '@prisma/client';
import type { Product } from '@prisma/client';
import prisma from './prisma.js';

export async function findAllProducts(): Promise<Product[]>  {
  const products:Product[] = await prisma.product.findMany();
  return products;
}

export async function createProducts(products: Omit<Prisma.ProductCreateInput, 'id'>[]): Promise<void> {
  await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });
}

export async function deleteProducts(): Promise<number> {
  const result = await prisma.product.deleteMany({ where: {} });
  return result.count;
};