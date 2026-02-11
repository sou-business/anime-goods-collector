import type { IProductScraper } from 'app_common/server';
import type { Element } from 'domhandler';
import { ProductModel } from 'app_common/server';
import { logger } from 'app_common/server';
import { fetchExternal } from 'app_common/server';
import * as cheerio from 'cheerio';

export class CospaScraper implements IProductScraper {
  readonly siteName = 'Cospa';
  readonly itemSelector = '.item_tn';

  async scrapeProducts(url: string): Promise<ProductModel[]> {
    // サイトにアクセス
    const response = await fetchExternal(url, undefined, undefined);
    const html = await response.text();
    // 収集したHTMLから商品情報抽出して返す
    return this.extractProductsFromHTML(url, cheerio.load(html));
  }

  extractProductsFromHTML(url: string, $: cheerio.CheerioAPI): ProductModel[] {
    const products: ProductModel[] = [];
    // 各アイテムをくくる「アイテムdiv」を探して、収集
    $(this.itemSelector).each((_:number, element:Element) => {
      try {
        // アイテム要素を分析・振り分け
        const $item = $(element);
        const title = $item.find('h3').text().trim();
        const priceText = $item.find('strong').text();
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const detailPath = $item.find('h3 a').attr('href');
        const imagePath = $item.find('.itembox img.item-tn').attr('src');

        if (!detailPath) {
          logger.warn('商品URLが見つからないため登録をスキップします');
          return; 
        }
        
        const detailUrl = new URL(detailPath, url).href;
        const imageUrl = new URL(imagePath ?? '', url).href;
        
        products.push(new ProductModel(
          null,
          detailUrl,
          title,
          imageUrl,
          price
        ));
      } catch (error) {
        logger.error('アイテム解析失敗', error);
      }
    });

    return products;
  }

}