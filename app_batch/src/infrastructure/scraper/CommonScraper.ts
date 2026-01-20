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
    const start = Date.now();
    const result = {
      sourceUrl: url,
      products: [] as ProductModel[],
      productCount: 0,
      durationMs: undefined as number | undefined,
    };

    let products: ProductModel[];
    try {
      logger.info(`Scraping start: ${url}`);
      products = await this.scraper.scrapeProducts(url);
      result.products = products;
      result.productCount = products.length;
      logger.info(`${products.length}件の商品を収集しました`);
      logger.info(`Scraping time: ${Date.now() - start}`);
      logger.info(`Scraping End: ${url}`);
    } catch (err) {
      throw err;
    }

    return products;
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
    logger.info(`scraping save start`);
    await this.save(products);
    cacheSet(CACHE_KEYS.PRODUCTS, products);
    logger.info(`scraping save end`);
    return products;
  }
}