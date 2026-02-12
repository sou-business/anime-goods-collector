import type { IProductScraper } from 'app_common/server';
import type { IProductRepository } from 'app_common/server';
import { ProductModel } from 'app_common/server';
import { logger } from 'app_common/server';
import { cacheSet } from 'app_common/server';
import { CACHE_KEYS } from 'app_common/server';

export class CommonScraper {
  constructor(
    private scraper: IProductScraper,
    private repository: IProductRepository
  ) {}

  // 商品をスクレイピングする
  async scrapeFromUrl(url: string): Promise<ProductModel[]> {
    const start = Date.now();

    logger.info(`Scraping start: ${url}`);
    const products: ProductModel[] = await this.scraper.scrapeProducts(url);
    logger.info(`${products.length}件の商品を収集しました`);
    logger.info(`Scraping time: ${Date.now() - start}`);
    logger.info(`Scraping End: ${url}`);

    return products;
  }

  // 商品を保存する
  async save(products: ProductModel[]): Promise<void> {
    await this.repository.saveProducts(products);
  }

  // 指定URLでの商品作成
  async createProductsFromUrl(
    url: string, 
  ): Promise<ProductModel[]> {
    const products = await this.scrapeFromUrl(url);
    logger.info(`scraping save start`);
    await this.save(products);
    await cacheSet(CACHE_KEYS.PRODUCTS, products);
    logger.info(`scraping save end`);
    return products;
  }
}