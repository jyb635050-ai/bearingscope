import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetStaticSnapshotCache, staticBearingApi } from '../src/lib/staticApi';
import type { FeedItem, LiveContentSnapshot } from '../src/shared/types';

const source = {
  id: 'publisher-test',
  name: { zh: '测试真实来源', en: 'Test real publisher' },
  type: 'rss' as const,
  tier: 'secondary' as const,
  verified: false,
  homepage: 'https://publisher.example/',
};

const liveItem: FeedItem = {
  id: 'real-news-1',
  kind: 'news',
  newsType: 'technology',
  demo: false,
  title: { zh: '真实轴承技术更新', en: 'Real bearing technology update' },
  originalTitle: 'Real bearing technology update',
  summary: { zh: '真实元数据。', en: 'Real metadata.' },
  keyFacts: [],
  brandIds: ['skf'],
  region: 'Global',
  categories: ['technology'],
  source,
  originalLanguage: 'en',
  publishedAt: '2026-07-11T10:00:00.000Z',
  fetchedAt: '2026-07-12T00:00:00.000Z',
  url: 'https://publisher.example/real-bearing-news',
  canonicalUrl: 'https://publisher.example/real-bearing-news',
  confidence: 0.8,
  relatedSourceUrls: [],
};

function snapshot(): LiveContentSnapshot {
  return {
    schemaVersion: 1,
    mode: 'live',
    generatedAt: '2026-07-12T00:00:00.000Z',
    feedItems: [liveItem],
    marketItems: [],
    researchItems: [],
    brands: [{
      id: 'skf',
      slug: 'skf',
      name: { zh: 'SKF', en: 'SKF' },
      shortName: 'SKF',
      country: { zh: '瑞典', en: 'Sweden' },
      aliases: ['SKF'],
      attentionList: true,
      wechatDisplayNames: [],
    }],
    sources: [source],
    sourceHealth: [{ id: 'test', status: 'ok', itemCount: 1, checkedAt: '2026-07-12T00:00:00.000Z' }],
  };
}

afterEach(() => {
  resetStaticSnapshotCache();
  vi.unstubAllGlobals();
});

describe('static live snapshot API', () => {
  it('loads the deployed snapshot and never marks real records as demo data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(snapshot()), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await staticBearingApi.feed({ q: 'SKF', pageSize: 20 });

    expect(response.demo).toBe(false);
    expect(response.items).toEqual([liveItem]);
    expect(response.items.every((item) => item.demo === false)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('data/live-content.json');
  });

  it('rejects an invalid snapshot instead of silently falling back to fixtures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ mode: 'demo' }), { status: 200 })));

    await expect(staticBearingApi.feed()).rejects.toThrow('停止展示');
  });

  it('uses source-backed research and source responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(snapshot()), { status: 200 })));

    const [research, sources] = await Promise.all([staticBearingApi.research(), staticBearingApi.sources()]);

    expect(research.demo).toBe(false);
    expect(sources.demo).toBe(false);
    expect(sources.items[0].homepage).toBe('https://publisher.example/');
  });
});
