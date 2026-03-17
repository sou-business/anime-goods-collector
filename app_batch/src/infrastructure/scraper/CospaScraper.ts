import { BaseScraper, ProductExtractors } from "@/infrastructure/scraper/BaseScraper.js";

export class CospaScraper extends BaseScraper {
  readonly siteName = 'Cospa';
  readonly itemSelector = '.item_tn';
  readonly extractors: ProductExtractors = {
    title: ($item): string => $item.find('h3').text().trim(),
    price: ($item): string => $item.find('strong').text(),
    detailPath: ($item): string => $item.find('h3 a').attr('href') ?? '',
    imagePath: ($item): string => $item.find('.itembox img.item-tn').attr('src') ?? ''
  };
}
