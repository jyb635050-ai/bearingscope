import { describe, expect, it, vi } from 'vitest';
import type { ContentItem, ResearchItem } from '../src/shared/types';
import { localizeText } from '../src/shared/localization';
import { SampleSourceAdapter } from '../server/adapters';
import { brands, marketItems, newsItems, researchItems, sources } from '../server/data';
import { canonicalizeUrl, deduplicateContent, fingerprintTitle, normalizeDoi } from '../server/dedupe';

describe('demo fixture integrity', () => {
  it('contains the required neutral, explicitly marked sample volume', () => {
    expect(newsItems.length).toBeGreaterThanOrEqual(30);
    expect(newsItems.filter((item) => item.kind === 'news').length).toBeGreaterThanOrEqual(30);
    expect(newsItems.filter((item) => item.source.type === 'wechat').length).toBeGreaterThanOrEqual(10);
    expect(marketItems).toHaveLength(8);
    expect(researchItems).toHaveLength(12);
    expect(brands).toHaveLength(10);
    expect(sources.filter((source) => source.type === 'wechat')).toHaveLength(10);
    expect([...newsItems, ...marketItems, ...researchItems].every((item) => item.demo)).toBe(true);
  });

  it('does not attach synthetic negative financial events to a real brand', () => {
    const sensitiveCategories = new Set(['loss', 'restructuring', 'merger']);
    const sensitiveItems = newsItems.filter((item) => item.categories.some((category) => sensitiveCategories.has(category)));

    expect(sensitiveItems.length).toBeGreaterThan(0);
    expect(sensitiveItems.every((item) => item.brandIds.length === 0 && Object.keys(item.kind === 'finance' ? item.metrics : {}).length === 0)).toBe(true);
  });

  it('stores WeChat display mappings without invented account identifiers', () => {
    const wechat = sources.filter((source) => source.type === 'wechat');
    expect(wechat.every((source) => source.verified === false)).toBe(true);
    expect(wechat.every((source) => source.brandId && source.notes?.zh.includes('未存储或臆造公众号 ID'))).toBe(true);
    expect(wechat.every((source) => source.homepage === 'https://mp.weixin.qq.com/')).toBe(true);
  });
});

describe('normalization and deduplication', () => {
  it('canonicalizes URLs and DOI identifiers deterministically', () => {
    expect(canonicalizeUrl('HTTPS://Example.COM:443/path/?utm_source=x&b=2&a=1#part'))
      .toBe('https://example.com/path?a=1&b=2');
    expect(normalizeDoi('https://doi.org/10.1234/ABC.Def?x=1')).toBe('10.1234/abc.def');
    expect(fingerprintTitle(' Hybrid—Bearing: 研究！ ')).toBe('hybridbearing研究');
  });

  it('deduplicates canonical URLs and keeps the higher-priority source', () => {
    const secondary = {
      ...newsItems[20],
      id: 'secondary-copy',
      url: 'https://example.invalid/story?utm_source=newsletter',
      canonicalUrl: undefined,
      source: { ...newsItems[20].source, tier: 'secondary' as const },
      confidence: 0.99,
    };
    const official = {
      ...newsItems[10],
      id: 'official-copy',
      url: 'https://example.invalid/story',
      canonicalUrl: undefined,
      source: { ...newsItems[10].source, tier: 'official' as const },
      confidence: 0.8,
    };

    const result = deduplicateContent([secondary, official]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('official-copy');
    expect(result[0].canonicalUrl).toBe('https://example.invalid/story');
  });

  it('uses title/time fallback only when a stable identifier is absent and links alternate reports', () => {
    const title = { zh: '相同标题', en: 'Same report title' };
    const withoutStableId = {
      ...newsItems[0],
      id: 'official-no-url',
      title,
      originalTitle: title.en,
      url: undefined,
      canonicalUrl: undefined,
      source: { ...newsItems[0].source, tier: 'official' as const },
    };
    const alternate = {
      ...newsItems[20],
      id: 'alternate-url',
      title,
      originalTitle: title.en,
      publishedAt: withoutStableId.publishedAt,
      url: 'https://example.invalid/alternate-report',
      canonicalUrl: undefined,
      source: { ...newsItems[20].source, tier: 'secondary' as const },
    };

    const result = deduplicateContent([alternate, withoutStableId]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('official-no-url');
    expect(result[0].relatedSourceUrls).toEqual(['https://example.invalid/alternate-report']);

    const distinctStableUrls = deduplicateContent([
      { ...alternate, id: 'first', url: 'https://example.invalid/one' },
      { ...alternate, id: 'second', url: 'https://example.invalid/two' },
    ]);
    expect(distinctStableUrls).toHaveLength(2);
  });

  it('deduplicates equivalent DOI forms', () => {
    const first: ResearchItem = { ...researchItems[0], id: 'doi-1', doi: '10.5555/DEMO.1' };
    const second: ResearchItem = { ...researchItems[1], id: 'doi-2', doi: 'https://doi.org/10.5555/demo.1' };
    const result = deduplicateContent([first, second]);

    expect(result).toHaveLength(1);
    expect(result[0].doi).toBe('10.5555/demo.1');
  });
});

describe('shared utilities and sample adapter', () => {
  it('falls back to the alternate language for blank translations', () => {
    expect(localizeText({ zh: '', en: 'Fallback' }, 'zh')).toBe('Fallback');
    expect(localizeText({ zh: '中文', en: '   ' }, 'en')).toBe('中文');
  });

  it('paginates cloned local fixtures and never invokes fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network disabled'));
    const adapter = new SampleSourceAdapter(newsItems as ContentItem[]);
    const first = await adapter.fetch({ limit: 3 });
    const second = await adapter.fetch({ cursor: first.nextCursor, limit: 3 });
    const normalized = adapter.normalize(first.records[0]);

    expect(first.records).toHaveLength(3);
    expect(first.nextCursor).toBe('3');
    expect(second.records[0].id).toBe(newsItems[3].id);
    expect(first.records[0]).not.toBe(newsItems[0]);
    expect(normalized.canonicalUrl).toBe(newsItems[0].canonicalUrl);
    expect((await adapter.health()).status).toBe('healthy');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
