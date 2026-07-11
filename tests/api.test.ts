import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, isValidWechatArticleUrl } from '../server/app';

describe('BearingScope API contracts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a paginated, filterable demo feed', async () => {
    const response = await request(createApp())
      .get('/api/v1/feed')
      .query({ sourceType: 'wechat', page: 1, pageSize: 4, sort: 'newest' })
      .expect(200);

    expect(response.body.demo).toBe(true);
    expect(response.body.items).toHaveLength(4);
    expect(response.body.pagination).toMatchObject({ page: 1, pageSize: 4, total: 10, totalPages: 3 });
    expect(response.body.filters.sourceTypes).toEqual(['wechat']);
    expect(response.body.items.every((item: { source: { type: string } }) => item.source.type === 'wechat')).toBe(true);
  });

  it('supports category, brand, region, time, and text filters', async () => {
    const response = await request(createApp())
      .get('/api/v1/feed')
      .query({
        q: '高速电驱',
        category: 'technology,product',
        brand: 'skf',
        region: 'Europe',
        time: '24h',
        sort: 'relevance',
      })
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].brandIds).toContain('skf');
    expect(response.body.filters).toMatchObject({ q: '高速电驱', time: '24h', sort: 'relevance' });
  });

  it('returns empty pagination without treating it as an error', async () => {
    const response = await request(createApp())
      .get('/api/v1/feed')
      .query({ q: 'this-term-does-not-exist' })
      .expect(200);

    expect(response.body.items).toEqual([]);
    expect(response.body.pagination).toMatchObject({ total: 0, totalPages: 0, hasNextPage: false });
  });

  it('rejects malformed enum, pagination, and brand parameters', async () => {
    const app = createApp();
    const invalidCategory = await request(app).get('/api/v1/feed?category=rumour').expect(400);
    const invalidPage = await request(app).get('/api/v1/feed?page=0').expect(400);
    const invalidBrand = await request(app).get('/api/v1/feed?brand=unknown-brand').expect(400);

    expect(invalidCategory.body.error.code).toBe('INVALID_REQUEST');
    expect(invalidPage.body.error.code).toBe('INVALID_REQUEST');
    expect(invalidBrand.body.error.code).toBe('INVALID_REQUEST');
  });

  it('serves every planned read endpoint with expected fixture counts', async () => {
    const app = createApp();
    const [trending, brandResponse, market, research, sourceResponse] = await Promise.all([
      request(app).get('/api/v1/trending').expect(200),
      request(app).get('/api/v1/brands').expect(200),
      request(app).get('/api/v1/market').expect(200),
      request(app).get('/api/v1/research?pageSize=100').expect(200),
      request(app).get('/api/v1/sources').expect(200),
    ]);

    expect(trending.body.topics).toHaveLength(5);
    expect(trending.body.brandAttention).toHaveLength(10);
    expect(brandResponse.body.items).toHaveLength(10);
    expect(brandResponse.body.disclaimer.zh).toContain('关注名单');
    expect(market.body.items).toHaveLength(8);
    expect(research.body.items).toHaveLength(12);
    expect(sourceResponse.body.items.filter((source: { type: string }) => source.type === 'wechat')).toHaveLength(10);
  });

  it('filters research and market endpoints', async () => {
    const app = createApp();
    const research = await request(app)
      .get('/api/v1/research')
      .query({ openAccess: 'true', page: 1, pageSize: 3, sort: 'citations' })
      .expect(200);
    const market = await request(app)
      .get('/api/v1/market')
      .query({ horizon: 'near' })
      .expect(200);

    expect(research.body.items).toHaveLength(3);
    expect(research.body.items.every((item: { openAccess: boolean }) => item.openAccess)).toBe(true);
    expect(market.body.items.every((item: { horizon: string }) => item.horizon === 'near')).toBe(true);
  });

  it('queues valid public WeChat article URLs without fetching them', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network access must remain disabled'));
    const response = await request(createApp())
      .post('/api/v1/imports/wechat')
      .send({
        url: 'https://mp.weixin.qq.com/s/example-public-article-token',
        title: '待审核文章',
        brandId: 'skf',
      })
      .expect(202);

    expect(response.body).toMatchObject({
      status: 'queued',
      item: {
        url: 'https://mp.weixin.qq.com/s/example-public-article-token',
        title: '待审核文章',
        brandId: 'skf',
      },
    });
    expect(response.body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects non-public or lookalike WeChat URLs', async () => {
    const app = createApp();
    const cases = [
      'http://mp.weixin.qq.com/s/example',
      'https://evil.example/s/example',
      'https://mp.weixin.qq.com.evil.example/s/example',
      'https://mp.weixin.qq.com/profile',
      'https://mp.weixin.qq.com/s',
      'https://mp.weixin.qq.com/s/',
    ];

    for (const url of cases) {
      const response = await request(app).post('/api/v1/imports/wechat').send({ url }).expect(400);
      expect(response.body.error.code).toBe('INVALID_WECHAT_URL');
      expect(isValidWechatArticleUrl(url)).toBe(false);
    }
  });

  it('returns structured errors for bad JSON and unknown routes', async () => {
    const app = createApp();
    const malformed = await request(app)
      .post('/api/v1/imports/wechat')
      .set('Content-Type', 'application/json')
      .send('{ nope')
      .expect(400);
    const missing = await request(app).get('/api/v1/not-real').expect(404);

    expect(malformed.body.error.code).toBe('INVALID_JSON');
    expect(missing.body.error.code).toBe('NOT_FOUND');
  });
});
