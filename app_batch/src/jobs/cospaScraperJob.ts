import { CospaScraper } from '@/infrastructure/scraper/CospaScraper.js';
import { ProductsRepository } from 'app_common/server';
import { CommonScraperService } from '@/application/service/CommonScraperService.js';
import { logger } from 'app_common/server';

const commonScraper: CommonScraperService = new CommonScraperService(
  new CospaScraper(),
  new ProductsRepository()
);

export async function cospaScrapingJob() {
  // Cospaのアイテム一覧ページを取得保存
  logger.info("Cospaのアイテム一覧ページを取得保存");
  await commonScraper.createProductsFromUrl("https://www.cospa.com/cospa/itemlist/id/009/mode/itemtype");
}