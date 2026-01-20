import { ProductModel } from '@/domain/model/ProductModel.js';

/**
 * 商品情報収集の抽象化
 */
export interface IProductScraper {
  /**
   * 指定されたURLにアクセスして商品情報を収集する
   * @param url - 商品一覧ページのURL
   * @returns 収集された商品の配列
   */
  scrapeProducts(url: string): Promise<ProductModel[]>;
}