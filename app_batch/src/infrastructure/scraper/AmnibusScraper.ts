import { BaseScraper, ProductExtractors } from "./BaseScraper.js";

export class AmnibusScraper extends BaseScraper {
  readonly siteName = 'Amnibus';
  readonly itemSelector = '.itemCard';
  readonly extractors: ProductExtractors = {
    title: ($item) => $item.find('.itemCard__desc--title').text().trim(),
    price: ($item) => $item.find('.itemCard__price--incTax').text(),
    detailPath: ($item) => $item.attr('href') ?? '',
    imagePath: ($item) => $item.find('.itemCard__img img').attr('src') ?? '',
  };
}