import { ProductEntity } from 'app_common/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('app_common/server', async (importOriginal) => ({
  // importOriginalでオリジナルを取得し、指定する関数だけモック化している
  ...await importOriginal(),
  fetchExternal: vi.fn(),
  logger: { warn: vi.fn(), error: vi.fn() },
}));

// モック対象モジュールを「後から」読み込むことによって、モックが効かない事故を防ぐ
const { fetchExternal, logger } = await import('app_common/server');
const { BaseScraper } = await import('@/infrastructure/scraper/BaseScraper.js');

// 外部サイトへの接続をモック化
type CollectorLike = { collectProductsFromUrl: (url: string) => Promise<unknown[]> };
const mockedFetchExternal = vi.mocked(fetchExternal);
async function collectWithHtml(scraper: CollectorLike, url: string, html: string) {
  mockedFetchExternal.mockResolvedValueOnce({ text: async () => html } as any);
  return await scraper.collectProductsFromUrl(url);
}

class TestScraper extends BaseScraper {
  readonly siteName = 'test';
  readonly itemSelector = '.item';
  readonly selectors = {
    title: '.title',
    price: '.price',
    detailPath: '.detail',
    imagePath: '.img',
  };
}

describe('BaseScraper.collectProductsFromUrl', () => {
  it('指定したサイトからHTMLを取得し、商品情報を抽出する', async () => {
    const scraper = new TestScraper();
    const baseUrl = 'https://example.com/list/';
    const html = `
      <div class="item">
        <a class="detail" href="/p/1">detail</a>
        <img class="img" src="/img/1.jpg" />
        <div class="title">  テスト商品  </div>
        <div class="price">税込 1,234円</div>
      </div>
    `;

    const products = await collectWithHtml(scraper, baseUrl, html);

    expect(fetchExternal).toHaveBeenCalledWith(baseUrl, undefined, undefined);
    expect(products).toHaveLength(1);
    const p:ProductEntity = products[0] as any;
    expect(p.detailUrl).toBe('https://example.com/p/1');
    expect(p.imageUrl).toBe('https://example.com/img/1.jpg');
    expect(p.title).toBe('テスト商品');
    expect(p.price).toBe(1234);
  });

  it('商品URLが無い場合はログに警告出力して、スキップする', async () => {
    const scraper = new TestScraper();
    const baseUrl = 'https://example.com/list/';
    const html = `
      <div class="item">
        <img class="img" src="/img/1.jpg" />
        <div class="title">商品</div>
        <div class="price">100円</div>
      </div>
    `;

    const products = await collectWithHtml(scraper, baseUrl, html);

    expect(products).toHaveLength(0);
    expect((logger as any).warn).toHaveBeenCalledTimes(1);
  });

  it('個別アイテムの解析に失敗しても、他のアイテムは継続して抽出する', async () => {
    const scraper = new TestScraper();
    const baseUrl = 'https://example.com/list/';
    const html = `
      <div class="item">
        <a class="detail" href="/p/bad">bad</a>
        <img class="img" src="http://[" />
        <div class="title">bad</div>
        <div class="price">100円</div>
      </div>
      <div class="item">
        <a class="detail" href="/p/ok">ok</a>
        <img class="img" src="/img/ok.jpg" />
        <div class="title">ok</div>
        <div class="price">200円</div>
      </div>
    `;

    const products = await collectWithHtml(scraper, baseUrl, html);

    expect((logger as any).error).toHaveBeenCalledTimes(1);
    expect(products).toHaveLength(1);
    expect((products[0] as any).detailUrl).toBe('https://example.com/p/ok');
  });
});

