import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductEntity } from 'app_common/client';
import { fetchInternal } from 'app_common/client';

export function useProducts() {
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (abortSignal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      // 内部 API のため retries=0, 短めの timeout を指定
      const res = await fetchInternal(
        '/api/products',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { timeoutMs: undefined, retries: undefined, retryDelayMs: undefined, abortSignal: abortSignal}
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null); 
        throw new Error(`サーバーエラーが発生しました (${res.status})`);
      }
      
      const data: ProductEntity[] = await res.json();
      // データ不正チェック
      if (!Array.isArray(data)) {
        throw new Error('サーバーからのレスポンス形式が不正です');
      }

      setProducts(data as ProductEntity[]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}