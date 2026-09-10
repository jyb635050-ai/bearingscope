import { describe, expect, it } from 'vitest';
import {
  brandScaleRanking,
  categoryFindings,
  salesSources,
  trendSeries,
  volumeDisclosures,
} from '../src/data/salesRankings';

describe('sales ranking research snapshot', () => {
  it('keeps ten ranked brands ordered by the disclosed-scope USD approximation', () => {
    expect(brandScaleRanking).toHaveLength(10);
    expect(brandScaleRanking.map((item) => item.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    for (let index = 1; index < brandScaleRanking.length; index += 1) {
      expect(brandScaleRanking[index - 1].approxUsdBn).toBeGreaterThanOrEqual(brandScaleRanking[index].approxUsdBn);
    }
  });

  it('does not invent unit volumes for brands without explicit disclosures', () => {
    expect(volumeDisclosures.map((item) => item.brand)).toEqual(['MinebeaMitsumi / NMB', 'C&U 人本']);
    expect(volumeDisclosures.every((item) => item.basis.zh.length > 20 && item.basis.en.length > 20)).toBe(true);
  });

  it('provides complete ten-year SKF and NSK series', () => {
    for (const id of ['skf', 'nsk']) {
      const series = trendSeries.find((item) => item.id === id);
      expect(series?.points).toHaveLength(10);
      expect(series?.points[0].year).toBe(2015);
      expect(series?.points.at(-1)?.year).toBe(2024);
    }
  });

  it('marks unsupported category leadership as insufficient evidence', () => {
    expect(categoryFindings.find((item) => item.id === 'deep-groove')?.verdict).toBe('insufficient');
    expect(categoryFindings.find((item) => item.id === 'needle')?.verdict).toBe('insufficient');
  });

  it('resolves every source reference to a primary-source register entry', () => {
    const sourceIds = new Set(salesSources.map((source) => source.id));
    const referencedIds = [
      ...brandScaleRanking.flatMap((item) => item.sourceIds),
      ...volumeDisclosures.flatMap((item) => item.sourceIds),
      ...trendSeries.flatMap((item) => item.sourceIds),
      ...categoryFindings.flatMap((item) => item.sourceIds),
    ];

    expect(referencedIds.every((id) => sourceIds.has(id))).toBe(true);
    expect(salesSources.every((source) => source.url.startsWith('https://'))).toBe(true);
  });
});
