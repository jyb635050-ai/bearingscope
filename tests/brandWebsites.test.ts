import { describe, expect, it } from 'vitest';
import { brandWebsiteRegions, brandWebsites } from '../src/data/brandWebsites';

describe('official bearing brand website directory', () => {
  it('contains a broad, geographically diverse manufacturer set', () => {
    expect(brandWebsites.length).toBeGreaterThanOrEqual(30);
    expect(new Set(brandWebsites.map((brand) => brand.region))).toEqual(new Set(['europe', 'japan', 'china', 'americas', 'asia']));
  });

  it('uses unique direct manufacturer domains with bilingual labels', () => {
    const ids = brandWebsites.map((brand) => brand.id);
    const urls = brandWebsites.map((brand) => brand.url);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(urls).size).toBe(urls.length);

    for (const brand of brandWebsites) {
      const parsed = new URL(brand.url);
      expect(['http:', 'https:']).toContain(parsed.protocol);
      expect(parsed.hostname).not.toMatch(/google|bing|baidu|wikipedia|linkedin|amazon|alibaba/i);
      expect(brand.name.zh.trim()).not.toBe('');
      expect(brand.name.en.trim()).not.toBe('');
      expect(brand.company.zh.trim()).not.toBe('');
      expect(brand.country.en.trim()).not.toBe('');
    }
  });

  it('provides an all option and every supported region filter', () => {
    expect(brandWebsiteRegions.map((region) => region.id)).toEqual(['all', 'europe', 'japan', 'china', 'americas', 'asia']);
  });
});
