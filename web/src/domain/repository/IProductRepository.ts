import { ProductModel } from "@/domain/model/ProductModel";

export interface IProductRepository {
  findAll(): Promise<ProductModel[]>;
  createProducts(products: ProductModel[]): Promise<void>;
  deleteAll(ids: number[]): Promise<void>;
}