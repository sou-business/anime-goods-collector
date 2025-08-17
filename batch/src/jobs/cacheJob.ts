import { CachedProductRepository } from "../infrastructure/repository/CachedProductRepository.js";
import { ProductsRepository } from "../infrastructure/repository/ProductsRepository.js";
import { ProductModel } from "../domain/model/ProductModel.js";
import { logger } from "@/utils/logger.js";

const cachedProductRepository : CachedProductRepository = new CachedProductRepository(new ProductsRepository());
const productsRepository: ProductsRepository = new ProductsRepository();

async function fetchAndCache() {
    logger.info("キャッシュスクリプトを実行開始");
    const products: ProductModel[] = await productsRepository.findAll();
    logger.info(`商品データをDBから取得しました: ${products.length}件`);

    cachedProductRepository.save(products).then(() => {
        logger.info("商品データをキャッシュに保存しました。");
    }).catch(error => {
        logger.error("商品データのキャッシュ保存に失敗しました:", error);
    });

    logger.info("キャッシュスクリプトを実行完了");
};

const oneHour = 60 * 60 * 1000; // 3600000ミリ秒

setInterval(() => {
  fetchAndCache();
}, oneHour);