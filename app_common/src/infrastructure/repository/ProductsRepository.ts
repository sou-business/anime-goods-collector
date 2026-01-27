import { IProductRepository } from "@/domain/repository/IProductRepository.js";
import { ProductModel } from "@/domain/model/ProductModel.js";
import { Prisma, Product } from "@prisma/client"
import { findAllProducts, createProducts, deleteProducts } from "@/infrastructure/db/productsTable.js";

export class ProductsRepository implements IProductRepository {

  async findAll(): Promise<ProductModel[]> {
    const products:Product[] = await findAllProducts();
    return products.map(product => new ProductModel(
      product.id,
      product.detailUrl,
      product.title,
      product.imageUrl ? product.imageUrl : null,
      product.price ? product.price : null
    ));
  }

  async saveProducts(products: ProductModel[]): Promise<void> {
    if (products.length === 0) {
      return;
    }

    const productData: Prisma.ProductCreateManyInput[] = products.map(product => {
      if (!product.detailUrl) {
        throw new Error(`商品のdetailUrlが必須です: ${product.title}`);
      }
      return {
        detailUrl: product.detailUrl,
        title: product.title,
        price: product.price ?? null,
        imageUrl: product.imageUrl ?? null,
      };
    });

    await createProducts(productData);
  }

  async deleteAll(): Promise<void> {
    await deleteProducts();
  }
 
}