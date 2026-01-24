import type { IProductScraper } from 'app_common';
import type { Element } from 'domhandler';
import { ProductModel } from 'app_common';
import { logger } from 'app_common';
import { fetchWithTimeoutAndRetries } from 'app_common';
import * as cheerio from 'cheerio';

export class CospaScraper implements IProductScraper {
  readonly siteName = 'Cospa';
  readonly itemSelector = '.item_tn';

  async scrapeProducts(url: string): Promise<ProductModel[]> {
    // ①サイトにアクセス
    const response = await fetchWithTimeoutAndRetries(url, undefined, undefined);
    const html = await response.text();
    // cheerioでHTMLテキストをjQueryライクに扱えるようにする
    const $ = cheerio.load(html);
    
    const products: ProductModel[] = [];
    // ②各アイテムをくくる「アイテムdiv」を探して、収集
    $(this.itemSelector).each((_:number, element:Element) => {
      try {
        // ③アイテムdiv内の要素を分析・振り分け
        const $item = $(element);
        const title = $item.find('h3').text().trim();
        const priceText = $item.find('strong').text();
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const detailPath = $item.find('h3 a').attr('href');
        const imagePath = $item.find('.itembox img.item-tn').attr('src');
        
        const detailUrl = detailPath ? new URL(detailPath, url).href : undefined;
        const imageUrl = imagePath ? new URL(imagePath, url).href : undefined;
        
        products.push(new ProductModel(
          title,
          price,
          detailUrl,
          imageUrl
        ));
      } catch (error) {
        logger.error('アイテム解析失敗', error);
      }
    });
    
    // ④収集結果を返す
    return products;
  }

}