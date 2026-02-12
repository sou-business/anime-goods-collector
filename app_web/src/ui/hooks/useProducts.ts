import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductModel } from 'app_common/client';
import { fetchInternal } from 'app_common/client';

export function useProducts() {
  const [products, setProducts] = useState<ProductModel[]>([]);
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

        // 独自エラー（messageフィールドがある場合）か判断
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        }

        // 3. それ以外500エラー等
        throw new Error(`サーバーエラーが発生しました (${res.status})`);
      }

      const data: ProductModel[] = await res.json();
      if (!Array.isArray(data)) {
        throw new Error('サーバーからのレスポンス形式が不正です');
      }

      setProducts(data as ProductModel[]);
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