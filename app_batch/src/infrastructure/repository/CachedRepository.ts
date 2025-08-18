import { logger } from "app_common";

export abstract class CachedRepository<T> {
  // 静的なメモリキャッシュ（全インスタンスで共有）
  private static cache: Map<string, unknown> = new Map();
  
  constructor(
    protected readonly cachePrefix: string
  ) {}

  protected getCacheKey(suffix: string): string {
    return `${this.cachePrefix}:${suffix}`;
  }

  // キャッシュから取得
  protected async getFromCache<U = T>(key: string): Promise<U | null> {
    const cacheKey = this.getCacheKey(key);
    const value = CachedRepository.cache.get(cacheKey);

    if (value !== undefined) {
      logger.info(`キャッシュヒット: ${cacheKey}`);
      return value as U; // 型アサーションで U に変換
    }

    return null;
  }

  // キャッシュに保存
  protected async setToCache<U = T>(key: string, value: U): Promise<void> {
    const cacheKey = this.getCacheKey(key);
    CachedRepository.cache.set(cacheKey, value);
    logger.info(`キャッシュ保存: ${cacheKey}`);
  }

  // キャッシュから削除
  protected async deleteFromCache(key: string): Promise<void> {
    const cacheKey = this.getCacheKey(key);
    const deleted = CachedRepository.cache.delete(cacheKey);
    if (deleted) {
      logger.info(`キャッシュ削除: ${cacheKey}`);
    }
  }

  // このドメインの全キャッシュをクリア
  async clearAllCache(): Promise<void> {
    const keysToDelete = Array.from(CachedRepository.cache.keys())
      .filter(key => key.startsWith(`${this.cachePrefix}:`));
    
    keysToDelete.forEach(key => CachedRepository.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      logger.info(`キャッシュクリア: ${this.cachePrefix} (${keysToDelete.length}件)`);
    }
  }

  // 共通のキー生成ヘルパー
  protected createIdKey(id: string): string {
    return `id:${id}`;
  }

  // デバッグ・管理用メソッド
  static getStats() {
    return {
      size: CachedRepository.cache.size,
      keys: Array.from(CachedRepository.cache.keys()),
      memoryUsage: process.memoryUsage() // Node.jsの場合
    };
  }

  static clearAllCaches(): void {
    CachedRepository.cache.clear();
    logger.info('全キャッシュクリア');
  }

  // 特定のパターンのキーを削除
  static clearPattern(pattern: string): void {
    const keysToDelete = Array.from(CachedRepository.cache.keys())
      .filter(key => key.includes(pattern) || key.match(new RegExp(pattern)));
    
    keysToDelete.forEach(key => CachedRepository.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      logger.info(`パターンクリア: ${pattern} (${keysToDelete.length}件)`);
    }
  }
}