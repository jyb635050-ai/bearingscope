import { describe, expect, it } from 'vitest';
import snapshotJson from '../public/data/live-content.json';
import type { LiveContentSnapshot } from '../src/shared/types';

const snapshot = snapshotJson as LiveContentSnapshot;

describe('expanded live news sources', () => {
  it('keeps substantial official C&U coverage with real source summaries', () => {
    const officialCu = snapshot.feedItems.filter(
      (item) => item.source.type === 'official' && item.source.brandId === 'cu',
    );
    expect(officialCu.length).toBeGreaterThanOrEqual(10);
    expect(officialCu.every((item) => item.url?.startsWith('https://www.cugroup.com/Common/Carrierinfo'))).toBe(true);
    expect(officialCu.some((item) => item.summary.zh.length > 80 && !item.summary.zh.includes('这是真实新闻索引'))).toBe(true);
  });

  it('records every newly enabled overseas and optional connector in source health', () => {
    const healthIds = new Set(snapshot.sourceHealth.map((source) => source.id));
    for (const id of [
      'rss-bearing-tips',
      'rss-motion-control-tips',
      'rss-rbc-bearings',
      'gdelt-global-bearing',
      'gdelt-cu-focus',
      'newsapi-everything',
      'official-cu',
    ]) {
      expect(healthIds.has(id)).toBe(true);
    }
  });
});
