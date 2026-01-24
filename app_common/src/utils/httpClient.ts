/**
 * 外部サイトにfetchで接続用する場合に使用する、タイムアウトとリトライを実装したfetch関数。
 * @param input The resource to fetch.
 * @param init Options for the fetch request.
 * @param opts Options for timeout and retries.
 * @returns The response from the fetch request.
 */
export async function fetchWithTimeoutAndRetries(
    input: RequestInfo,
    init?: RequestInit,
    opts?: { timeoutMs?: number; retries?: number; retryDelayMs?: number }
): Promise<Response> {
    const { timeoutMs = 10000, retries = 2, retryDelayMs = 500 } = opts || {};
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(input, { ...(init || {}), signal: controller.signal });
            clearTimeout(id);
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
            return res;
        } catch (err) {
            clearTimeout(id);
            const last = attempt === retries;
            if (last) throw err;
            await new Promise(r => setTimeout(r, retryDelayMs * Math.pow(2, attempt)));
        }
    }
    throw new Error('fetchWithTimeoutAndRetries: unreachable');
}