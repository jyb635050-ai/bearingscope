import { describe, expect, it } from 'vitest';
import snapshot from '../public/data/live-content.json';

describe('deployed live content localization', () => {
  it('contains complete Chinese titles and summaries for every visible item', () => {
    const allItems = [...snapshot.feedItems, ...snapshot.marketItems, ...snapshot.researchItems];
    const withoutChineseTitle = allItems
      .filter((item) => !/[\u3400-\u9fff]/u.test(item.title.zh))
      .map((item) => `${item.kind}:${item.id}:${item.title.zh}`);
    const withoutChineseSummary = allItems
      .filter((item) => !/[\u3400-\u9fff]/u.test(item.summary.zh))
      .map((item) => `${item.kind}:${item.id}`);

    expect(withoutChineseTitle).toEqual([]);
    expect(withoutChineseSummary).toEqual([]);
    expect(allItems.every((item) => item.demo === false)).toBe(true);
  });
});
