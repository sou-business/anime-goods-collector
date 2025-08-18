import { ProductModel } from "app_common";
import { IProductRepository } from "app_common";
import { Prisma, Product } from 'app_common';
import { findAllProducts, createProducts, deleteProducts} from  '@/infrastructure/db/productsTable';

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
      price: product.price,
      detail_url: product.detail_url,
      image_url: product.image_url,
    }));

    await createProducts(productData);
  }

  async deleteAll(): Promise<void> {
    await deleteProducts();
  }
 
}