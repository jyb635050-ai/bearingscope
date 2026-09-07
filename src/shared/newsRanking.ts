import type { FeedItem } from './types';

/** Seven-day editorial signals: freshness, source quality and industry impact. */
export function rankDailySignals(items: FeedItem[], now: number): FeedItem[] {
  const day = 86_400_000;
  const score = (item: FeedItem) => {
    const age = (now - Date.parse(item.publishedAt)) / day;
    const impact = item.categories.some((category) => ['finance', 'merger', 'capacity', 'technology', 'product', 'restructuring'].includes(category));
    return 10 * Math.exp(-age / 2) + (item.source.tier === 'official' ? 2 : 0) + (impact ? 2 : 0);
  };
  return items.filter((item) => {
    const age = now - Date.parse(item.publishedAt);
    return Number.isFinite(age) && age >= 0 && age <= 7 * day;
  }).sort((a, b) => score(b) - score(a) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 10);
}
