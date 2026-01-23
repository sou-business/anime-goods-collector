import { IProductRepository } from "@/domain/repository/IProductRepository.js";
import { ProductModel } from "@/domain/model/ProductModel.js";
import { Prisma, Product } from "@prisma/client"
import { findAllProducts, createProducts, deleteProducts } from "@/infrastructure/db/productsTable.js";

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
    const productData: Prisma.ProductCreateManyInput[] = products.map(product => {
      if (!product.detail_url) {
        throw new Error(`商品のdetail_urlが必須です: ${product.title}`);
      }
      return {
        detail_url: product.detail_url,
        title: product.title,
        price: product.price ?? null,
        image_url: product.image_url ?? null,
      };
    });

    await createProducts(productData);
  }

  async deleteAll(): Promise<void> {
    await deleteProducts();
  }
 
}