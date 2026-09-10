import { describe, expect, it } from 'vitest';
import { annualSalesSources, createAnnualRankings } from '../src/data/annualSalesRankings';
import {
  brandScaleRanking,
  categoryFindings,
  salesRankingYears,
  salesSources,
  trendSeries,
  volumeDisclosures,
} from '../src/data/salesRankings';

const brandScaleRankings = createAnnualRankings(brandScaleRanking);

describe('sales ranking research snapshot', () => {
  it('keeps ten ranked brands ordered by the disclosed-scope USD approximation', () => {
    expect(salesRankingYears).toEqual([2025, 2024, 2023]);
    for (const year of salesRankingYears) {
      const ranking = brandScaleRankings[year];
      expect(ranking).toHaveLength(10);
      expect(ranking.map((item) => item.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      for (let index = 1; index < ranking.length; index += 1) {
        expect(ranking[index - 1].approxUsdBn).toBeGreaterThanOrEqual(ranking[index].approxUsdBn);
      }
    }
  });

  it('keeps each year distinct and reflects the 2025 NTN/JTEKT order change', () => {
    expect(brandScaleRankings[2025][4].brand).toBe('NTN');
    expect(brandScaleRankings[2025][5].brand).toBe('JTEKT / Koyo');
    expect(brandScaleRankings[2023][0].reported.zh).not.toBe(brandScaleRankings[2025][0].reported.zh);
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
    const allSources = [...salesSources, ...annualSalesSources];
    const sourceIds = new Set(allSources.map((source) => source.id));
    const referencedIds = [
      ...salesRankingYears.flatMap((year) => brandScaleRankings[year].flatMap((item) => item.sourceIds)),
      ...brandScaleRanking.flatMap((item) => item.sourceIds),
      ...volumeDisclosures.flatMap((item) => item.sourceIds),
      ...trendSeries.flatMap((item) => item.sourceIds),
      ...categoryFindings.flatMap((item) => item.sourceIds),
    ];

    expect(referencedIds.every((id) => sourceIds.has(id))).toBe(true);
    expect(allSources.every((source) => source.url.startsWith('https://'))).toBe(true);
  });
});
