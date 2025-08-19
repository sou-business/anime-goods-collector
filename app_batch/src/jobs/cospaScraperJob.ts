import { CospaScraper } from '@/infrastructure/scraper/CospaScraper.js';
import { ProductsRepository } from 'app_common';
import { CommonScraper } from '@/infrastructure/scraper/CommonScraper.js';
import { logger } from 'app_common';

const commonScraper: CommonScraper = new CommonScraper(
  new CospaScraper(),
  new ProductsRepository()
);

export async function cospaScrapingJob() {
  // Cospaのアイテム一覧ページを取得保存
  logger.info("Cospaのアイテム一覧ページを取得保存");
  await commonScraper.createProductsFromUrl("https://www.cospa.com/cospa/itemlist/id/009/mode/itemtype");
}