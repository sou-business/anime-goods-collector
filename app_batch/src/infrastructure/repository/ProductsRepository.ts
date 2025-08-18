import { ProductModel } from "app_common";
import { findAllProducts, createProducts, deleteProducts} from  '../db/productsTable.js';
import type { Prisma, Product } from '@prisma/client';
import type { IProductRepository } from "app_common";

export class ProductsRepository implements IProductRepository {

  async findAll(): Promise<ProductModel[]> {
    const products:Product[] = await findAllProducts();
    return products.map(product => new ProductModel(
      product.title ?? '',
      product.price ? product.price : undefined,
      product.detail_url  ? product.detail_url : undefined,
      product.image_url ? product.image_url : undefined
    ));
  }

  async createProducts(products: ProductModel[]): Promise<void> {
    const productData: Prisma.ProductCreateManyInput[] = products.map(product => ({
    title: product.title,
    price: product.price ?? null,
    detail_url: product.detail_url ?? null, 
    image_url: product.image_url ?? null,
  }));

    await createProducts(productData);
  }

  async deleteAll(): Promise<void> {
    await deleteProducts();
  }
 
}