import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductModel } from 'app_common/client';
import { fetchInternal } from 'app_common/client';

export function useProducts() {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;

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
        { timeoutMs: undefined, retries: undefined, retryDelayMs: undefined, signal: controller.signal }
      );

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('サーバーからのレスポンス形式が不正です');

      setProducts(data as ProductModel[]);
    } catch (err) {
      if ((err as any).name === 'AbortError') return;
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    return () => abortRef.current?.abort();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}