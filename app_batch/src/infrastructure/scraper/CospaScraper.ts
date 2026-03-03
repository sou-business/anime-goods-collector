import { ProductSelectors, BaseScraper } from "./BaseScraper.js";  

export class CospaScraper extends BaseScraper {
  readonly siteName = 'Cospa';
  readonly itemSelector = '.item_tn';
  readonly selectors: ProductSelectors = {
    title: 'h3',
    price: 'strong',
    detailPath: 'h3 a',
    imagePath: '.itembox img.item-tn',
  };
}