import { ProductsRepository } from 'app_common/server';
import { logger } from 'app_common/server';
import { CommonScraperService } from '@/application/service/CommonScraperService.js';
import { AmnibusScraper } from '@/infrastructure/scraper/AmnibusScraper.js';

const commonScraper: CommonScraperService = new CommonScraperService(
  new AmnibusScraper(),
  new ProductsRepository()
);

export async function amnibusScrapingJob() {
  logger.info("Amnibusサイトから商品を取得保存");
  await commonScraper.saveProductsFromUrl("https://amnibus.com/products/list?search_words=Tシャツ");
}