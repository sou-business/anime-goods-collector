import { ProductEntity } from "@/domain/entity/ProductEntity.js";

export interface IProductRepository {
  findAll(): Promise<ProductEntity[]>;
  saveProducts(products: ProductEntity[]): Promise<void>;
}