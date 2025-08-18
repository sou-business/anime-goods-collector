import { ProductModel } from '@/domain/model/ProductModel.js';

/**
 * 商品情報収集の抽象化
 */
export interface IProductScraper {
  /**
   * サイト名（識別用）
   */
  readonly siteName: string;

  /**
   * 指定されたURLにアクセスして商品情報を収集する
   * @param url - 商品一覧ページのURL
   * @returns 収集された商品の配列
   */
  scrapeProducts(url: string): Promise<ProductModel[]>;

  /**
   * 指定されたURLがこのスクレイパーで処理可能かチェック
   * @param url - チェック対象のURL
   * @returns 処理可能な場合true
   */
  canHandle(url: string): boolean;

  /**
   * アイテムを囲むdivのCSSセレクター
   * 例: '.item_tn', '.product-item', '[data-product]'
   */
  readonly itemSelector: string;
}

/**
 * スクレイピング結果の統計情報
 */
export interface ScrapingResult {
  products: ProductModel[];
  totalFound: number;
  successCount: number;
  failedCount: number;
  scrapedAt: Date;
  sourceUrl: string;
  siteName: string;
}