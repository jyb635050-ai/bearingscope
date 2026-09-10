import { describe, expect, it } from 'vitest';
import { parseCuOfficialPayload, parseGdeltPayload, parseNewsApiPayload } from '../scripts/news-connectors';

describe('news connector normalization', () => {
  it('normalizes official C&U newsroom records and keeps the official article URL', () => {
    const items = parseCuOfficialPayload({
      data: [{
        Id: '524feeda-a548-4369-bcd3-104e21392254',
        CreateTime: '/Date(1778481357000)/',
        Title: '人本品牌强度905分，品牌价值48.58亿元！',
        Blurb: '<p>人本集团发布新的品牌价值信息。</p>',
      }],
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      officialBrandId: 'cu',
      official: true,
      sourceName: 'C&U Group official newsroom',
      publishedAt: '2026-05-11T06:35:57.000Z',
    });
    expect(items[0].url).toContain('www.cugroup.com/Common/Carrierinfo');
    expect(items[0].summary).toBe('人本集团发布新的品牌价值信息。');
  });

  it('rejects unrelated C&U records without an editorial industry or company signal', () => {
    expect(parseCuOfficialPayload({
      data: [{ Id: 'x', CreateTime: '2026-05-11T06:35:57Z', Title: '周末随笔', Blurb: '春日散步。' }],
    })).toEqual([]);
  });

  it('parses GDELT compact UTC timestamps', () => {
    const items = parseGdeltPayload({
      articles: [{
        title: 'SKF opens new bearing facility',
        url: 'https://example.com/skf-bearing',
        seendate: '20260909T142501Z',
        domain: 'example.com',
      }],
    }, 'gdelt-global');
    expect(items[0]).toMatchObject({
      publishedAt: '2026-09-09T14:25:01.000Z',
      sourceName: 'example.com',
      feedId: 'gdelt-global',
    });
  });

  it('normalizes NewsAPI articles and drops removed entries', () => {
    const items = parseNewsApiPayload({
      articles: [
        { title: '[Removed]', url: 'https://example.com/removed', publishedAt: '2026-09-09T00:00:00Z' },
        { title: 'Timken reports bearing demand', url: 'https://example.com/timken', publishedAt: '2026-09-09T00:00:00Z', source: { name: 'Example Wire' } },
      ],
    }, 'newsapi-everything');
    expect(items).toHaveLength(1);
    expect(items[0].sourceName).toBe('Example Wire');
  });
});
