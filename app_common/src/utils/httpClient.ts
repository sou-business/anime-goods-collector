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
 * - externalSignal があればそれを監視して内部 controller を abort する（マージ）
 * - fetch 自体の実行とタイマー／リスナーの解放のみ担当する（非 ok 判定は呼び出し元で）
 */
async function attemptFetch(
  input: RequestInfo,
  init: RequestInit | undefined,
  timeoutMs: number,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort);
    }
  }

  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...(init || {}), signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
  }
}

/**
 * 内部API向け: 短めタイムアウト、リトライ無しがデフォルト。
 * throwOnHttpError = true の場合は HttpError を投げる（body を読み取って含める）。
 */
export async function fetchInternal(
  input: RequestInfo,
  init?: RequestInit,
  opts?: HttpClientOpts & { signal?: AbortSignal }
): Promise<Response> {
  const {
    timeoutMs = 5000,
    retries = 0,
    retryDelayMs = 100,
    signal: externalSignal
  } = opts || {};

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await attemptFetch(input, init, timeoutMs, externalSignal);
      return res;
    } catch (err) {
      // external abort が原因なら再試行せず即時伝播
      if (err instanceof Error && err.name === 'AbortError' && opts?.signal?.aborted) {
        throw err;
      }
      const last = attempt === retries;
      if (last) throw err;
      const delay = Math.min(30000, retryDelayMs * Math.pow(2, attempt)) + Math.floor(Math.random() * 100);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw new Error('fetchInternal: unreachable');
}

/**
 * 外部向け: 長めタイムアウト、リトライありがデフォルト。
 */
export async function fetchExternal(
  input: RequestInfo,
  init?: RequestInit,
  opts?: HttpClientOpts & { signal?: AbortSignal }
): Promise<Response> {
  const {
    timeoutMs = 15000,
    retries = 2,
    retryDelayMs = 500
  } = opts || {};

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await attemptFetch(input, init, timeoutMs, undefined);

      if (!res.ok) {
        throw new HttpError(res.status, res.statusText, await res.text());
      }

      return res;
    } catch (err) {      
      const last = attempt === retries;
      
      if (last) throw err;
      
      const delay = Math.min(30000, retryDelayMs * Math.pow(2, attempt)) + Math.floor(Math.random() * 100);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  // TypeScriptの型チェックを満たすため（実際には到達しない）
  throw new Error('fetchExternal: unreachable:');
}