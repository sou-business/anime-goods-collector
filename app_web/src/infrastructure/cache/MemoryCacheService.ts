export class MemoryCacheService {
  private cache: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    if (value !== undefined) {
      console.log(`キャッシュヒット: ${key}`);
      return value;
    }
    return null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
    console.log(`キャッシュ保存: ${key}`);
  }

  async delete(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`キャッシュ削除: ${key}`);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    console.log('キャッシュ全削除');
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  // デバッグ・管理用メソッド
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getSize(): number {
    return this.cache.size;
  }

  // 特定のパターンのキーを削除（定期更新で使える）
  async clearPattern(pattern: string): Promise<void> {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern) || key.match(new RegExp(pattern))
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`パターン削除: ${pattern} (${keysToDelete.length}件)`);
    }
  }

  // キャッシュの状態確認
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: process.memoryUsage() // Node.jsの場合
    };
  }
}