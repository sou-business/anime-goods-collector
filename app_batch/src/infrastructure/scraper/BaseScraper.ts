import type { Element } from 'domhandler';
import type { IProductCollector } from 'app_common/server';
import { ProductEntity } from 'app_common/server';
import { fetchExternal } from 'app_common/server';
import { logger } from 'app_common/server';
import * as cheerio from 'cheerio';

export interface ProductSelectors {
    title: string;        
    price: string;        
    detailPath: string;   
    imagePath: string;    
}
  
export abstract class BaseScraper implements IProductCollector {
    abstract readonly siteName: string;
    abstract readonly itemSelector: string;
    abstract readonly selectors: ProductSelectors;

    async collectProductsFromUrl(url: string): Promise<ProductEntity[]> {
        const response = await fetchExternal(url, undefined, undefined);
        const html = await response.text();
        return this.extractProductsFromHTML(url, cheerio.load(html));
    }

    private extractProductsFromHTML(url: string, $: cheerio.CheerioAPI): ProductEntity[] {
        const products: ProductEntity[] = [];
        $(this.itemSelector).each((_:number, element) => {
            try {
                const $item = $(element as Element);
                const title = $item.find(this.selectors.title).text().trim();
                const priceText = $item.find(this.selectors.price).text();
                const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
                const detailPath = $item.find(this.selectors.detailPath).attr('href');
                const imagePath = $item.find(this.selectors.imagePath).attr('src');

                if (!detailPath) {
                    logger.warn('商品URLが見つからないため登録をスキップします');
                    return;
                }

                products.push(new ProductEntity(
                    null,
                    new URL(detailPath, url).href,
                    title,
                    new URL(imagePath ?? '', url).href,
                    price
                ));
            } catch (error) {
                logger.error('アイテム解析失敗', error);
            }
        });
        return products;
    }
}