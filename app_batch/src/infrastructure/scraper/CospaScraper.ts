import { BaseScraper, ProductExtractors } from "./BaseScraper.js";

export class CospaScraper extends BaseScraper {
  readonly siteName = 'Cospa';
  readonly itemSelector = '.item_tn';
  readonly extractors: ProductExtractors = {
    title: ($item) => $item.find('h3').text().trim(),
    price: ($item) => $item.find('strong').text(),
    detailPath: ($item) => $item.find('h3 a').attr('href') ?? '',
    imagePath: ($item) => $item.find('.itembox img.item-tn').attr('src') ?? ''
  };
}
