import { describe, expect, it } from 'vitest';
import registry from '../data/manual-wechat-imports.json';
import snapshot from '../public/data/live-content.json';

const articleUrl = 'https://mp.weixin.qq.com/s/lqnVorvOAi-bCIq9UwVqdg';

describe('manually reviewed WeChat sources', () => {
  it('stores the verified C&U account identity and public article metadata', () => {
    const account = registry.find((item) => item.accountId === 'gh_4d96502f1cb9');

    expect(account).toMatchObject({
      brandId: 'cu',
      accountDisplayName: 'C&U人本轴承',
      biz: 'MzA3NzMyNDYwMw==',
      verified: true,
      verificationUrl: articleUrl,
    });
    expect(account?.articles.some((article) => article.url === articleUrl)).toBe(true);
  });

  it('publishes the reviewed article as real WeChat content under C&U', () => {
    const item = snapshot.feedItems.find((candidate) => candidate.url === articleUrl);
    const brand = snapshot.brands.find((candidate) => candidate.id === 'cu');
    const source = snapshot.sources.find((candidate) => candidate.id === item?.source.id);
    const health = snapshot.sourceHealth.find((candidate) => candidate.id === 'wechat-manual-imports');

    expect(item).toMatchObject({
      kind: 'news',
      demo: false,
      title: { zh: '锻造｜以锤炼之骨，造就一重新生' },
      brandIds: ['cu'],
      source: { type: 'wechat', verified: true, brandId: 'cu' },
    });
    expect(brand?.wechatDisplayNames).toContain('C&U人本轴承');
    expect(source?.verified).toBe(true);
    expect(health).toMatchObject({ status: 'ok', itemCount: 1 });
  });
});
