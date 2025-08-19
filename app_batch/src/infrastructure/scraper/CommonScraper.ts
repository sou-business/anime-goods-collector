import type { IProductScraper } from 'app_common';
import type { IProductRepository } from 'app_common';
import { ProductModel } from 'app_common';
import { logger } from 'app_common';
import { cacheSet } from 'app_common';
import { CACHE_KEYS } from 'app_common';

export class CommonScraper {
  constructor(
    private scraper: IProductScraper,
    private repository: IProductRepository
  ) {}

  // 商品をスクレイピングする
  async scrapeFromUrl(url: string): Promise<ProductModel[]> {
    return await this.scraper.scrapeProducts(url);
  }

  // 商品情報をログ出力する
  logResults(products: ProductModel[]): void {
    logger.info(`${products.length}件の商品を収集しました`);
  }

  // 商品を保存する
  async save(products: ProductModel[]): Promise<void> {
    await this.repository.createProducts(products);
  }

  // 指定URLでの商品作成
  async createProductsFromUrl(
    url: string, 
  ): Promise<ProductModel[]> {
    const products = await this.scrapeFromUrl(url);
    
    this.logResults(products);
    
    await this.save(products);
    cacheSet(CACHE_KEYS.PRODUCTS, products);
    return products;
  }

}