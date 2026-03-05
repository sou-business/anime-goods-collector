import { ProductsRepository } from 'app_common/server';
import { logger } from 'app_common/server';
import { CommonScraperService } from '@/application/service/CommonScraperService.js';
import { CospaScraper } from '@/infrastructure/scraper/CospaScraper.js';

const commonScraper: CommonScraperService = new CommonScraperService(
  new CospaScraper(),
  new ProductsRepository()
);

export async function cospaScrapingJob() {
  logger.info("Cospaサイトから商品を取得保存");
  await commonScraper.saveProductsFromUrl("https://www.cospa.com/cospa/itemlist/id/009/mode/itemtype");
}