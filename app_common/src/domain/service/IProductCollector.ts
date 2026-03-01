import { ProductEntity } from '@/domain/entity/ProductEntity.js';

/**
 * 商品情報収集の抽象化
 */
export interface IProductCollector {
  /**
   * 指定されたURLにアクセスして商品情報を収集する
   * @param url - 商品一覧ページのURL
   * @returns 収集された商品の配列
   */
  collectProductsFromUrl(url: string): Promise<ProductEntity[]>;
}