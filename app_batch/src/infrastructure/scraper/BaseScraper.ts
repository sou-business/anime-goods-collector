import type { Element } from 'domhandler';
import * as cheerio from 'cheerio';
import type { IProductCollector } from 'app_common/server';
import { ProductEntity } from 'app_common/server';
import { fetchExternal } from 'app_common/server';
import { logger } from 'app_common/server';
import { buildProductEntity } from '@/infrastructure/factory/ProductFactory.js';

type ExtractionLogic = ($item: cheerio.Cheerio<any>) => string;
export interface ProductExtractors {
    title: ExtractionLogic;
    price: ExtractionLogic;
    detailPath: ExtractionLogic;
    imagePath: ExtractionLogic;  
}
  
export abstract class BaseScraper implements IProductCollector {
    abstract readonly siteName: string;
    abstract readonly itemSelector: string;
    abstract readonly extractors: ProductExtractors;

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
                const detailPath = this.extractors.detailPath($item);
                if (!detailPath) {
                    logger.warn('商品URLが見つからないため登録をスキップします');
                    return;
                }
                const imagePath = this.extractors.imagePath($item);
                const title = this.extractors.title($item);
                const price = this.extractors.price($item);

                products.push(buildProductEntity(url, detailPath, imagePath, title, price));

            } catch (error) {
                logger.error('アイテム解析失敗', error);
            }
        });
        return products;
    }
}