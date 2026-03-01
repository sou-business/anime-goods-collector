import type { IProductCollector } from 'app_common/server';
import type { IProductRepository } from 'app_common/server';
import { ProductEntity } from 'app_common/server';
import { logger } from 'app_common/server';

export class CommonScraperService {
  constructor(
    private scraper: IProductCollector,
    private repository: IProductRepository
  ) {}

  // 商品をスクレイピングする
  async scrapeFromUrl(url: string): Promise<ProductEntity[]> {
    const start = Date.now();

    logger.info(`Scraping start: ${url}`);
    const products: ProductEntity[] = await this.scraper.collectProductsFromUrl(url);
    logger.info(`${products.length}件の商品を収集しました`);
    logger.info(`Scraping time: ${Date.now() - start}`);
    logger.info(`Scraping End: ${url}`);

    return products;
  }

  // 商品を保存する
  async save(products: ProductEntity[]): Promise<void> {
    await this.repository.saveProducts(products);
  }

  // 指定URLでの商品作成
  async createProductsFromUrl(
    url: string, 
  ): Promise<ProductEntity[]> {
    const products = await this.scrapeFromUrl(url);
    logger.info(`scraping save start`);
    await this.save(products);
    logger.info(`scraping save end`);
    return products;
  }
}