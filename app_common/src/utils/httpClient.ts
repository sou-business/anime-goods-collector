export type HttpClientOpts = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  throwOnHttpError?: boolean;
};

export class HttpError extends Error {
  status: number;
  statusText: string;
  body: unknown;
  constructor(status: number, statusText: string, body: unknown) {
    super(`HTTP ${status} ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

/**
 * 単一試行を担当するヘルパー。
 * - timeoutMs を使って内部 AbortController を作る
 * - 外部からのabort指定があればそれを、内部controllerをabortする
 * - fetch 自体の実行とタイマー／リスナーの解放のみ担当する（非 ok 判定は呼び出し元で）
 */
async function attemptFetch(
  input: RequestInfo,
  init: RequestInit | undefined,
  timeoutMs: number,
  abortSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();

  if (abortSignal) {
    if (abortSignal.aborted) {
      controller.abort();
    } else {
      abortSignal.addEventListener('abort', onExternalAbort);
    }
  }

  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...(init || {}), signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
    if (abortSignal) abortSignal.removeEventListener('abort', onExternalAbort);
  }
}

/**
 * 外部API用のリトライ判断
 */
function shouldRetryExternal(err: unknown): boolean {
  // ネットワークエラー
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return true;
  }
  
  // タイムアウト
  if (err instanceof Error && err.name === 'AbortError') {
    return true;
  }
  
  // HTTPエラー
  if (err instanceof HttpError) {
    // 5xx: サーバーエラー 
    if (err.status >= 500) return true;
    // 429: Too Many Requests
    if (err.status === 429) return true;
    // 408: Request Timeout
    if (err.status === 408) return true;
    return false;
  }
  // 不明なエラー
  return false;
}

/**
 * 共通のリトライ・タイムアウト制御ロジック
 */
async function fetchCore(
  input: RequestInfo,
  init: RequestInit | undefined,
  opts: {
    timeoutMs: number;
    retries: number;
    retryDelayMs: number;
    abortSignal?: AbortSignal;
  },
  shouldRetryFn?: (err: unknown) => boolean
): Promise<Response> {
  const { timeoutMs, retries, retryDelayMs, abortSignal } = opts;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await attemptFetch(input, init, timeoutMs, abortSignal);
      return res;
    } catch (err) {
      // ユーザーキャンセル: 即座に終了
      if (err instanceof Error && err.name === 'AbortError' && abortSignal?.aborted) {
        throw err;
      }
      
      // リトライ対象かつリトライ不可と判断されたら中断
      if (shouldRetryFn && !shouldRetryFn(err)) {
        throw err;
      }
      
      // リトライ回数超過なら中断
      const last = attempt === retries;
      if (last) throw err;
      
      // リトライ
      const delay = Math.min(30000, retryDelayMs * Math.pow(2, attempt)) + Math.floor(Math.random() * 100);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw new Error('fetchWithRetry: unreachable');
}

/**
 * 内部API向け
 */
export async function fetchInternal(
  input: RequestInfo,
  init?: RequestInit,
  opts?: HttpClientOpts & { abortSignal?: AbortSignal }
): Promise<Response> {
  return fetchCore(
    input,
    init,
    {
      timeoutMs: opts?.timeoutMs ?? 5000,
      retries: opts?.retries ?? 0,
      retryDelayMs: opts?.retryDelayMs ?? 100,
      abortSignal: opts?.abortSignal
    }
  );
}

/**
 * 外部API向け
 */
export async function fetchExternal(
  input: RequestInfo,
  init?: RequestInit,
  opts?: HttpClientOpts & { abortSignal?: AbortSignal }
): Promise<Response> {
  return fetchCore(
    input,
    init,
    {
      timeoutMs: opts?.timeoutMs ?? 15000,
      retries: opts?.retries ?? 2,
      retryDelayMs: opts?.retryDelayMs ?? 500,
      abortSignal: opts?.abortSignal
    },
    shouldRetryExternal
  );
}