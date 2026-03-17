import { BaseScraper, ProductExtractors } from "@/infrastructure/scraper/BaseScraper.js";

export class AmnibusScraper extends BaseScraper {
  readonly siteName = 'Amnibus';
  readonly itemSelector = '.itemCard';
  readonly extractors: ProductExtractors = {
    title: ($item): string => $item.find('.itemCard__desc--title').text().trim(),
    price: ($item): string => $item.find('.itemCard__price--incTax').text(),
    detailPath: ($item): string => $item.attr('href') ?? '',
    imagePath: ($item): string => $item.find('.itemCard__img img').attr('src') ?? '',
  };
}