import { expect, it } from 'vitest';
import { rankDailySignals } from '../src/shared/newsRanking';
import { newsItems } from '../server/data';

it('excludes future and stale news and favors a recent industry event', () => {
  const now = Date.parse('2026-09-07T12:00:00Z');
  const item = newsItems[0];
  const entries = [
    { ...item, id: 'stale', publishedAt: '2026-08-01T00:00:00Z' },
    { ...item, id: 'future', publishedAt: '2026-10-01T00:00:00Z' },
    { ...item, id: 'older', publishedAt: '2026-09-02T00:00:00Z' },
    { ...item, id: 'today', publishedAt: '2026-09-07T10:00:00Z' },
  ];
  expect(rankDailySignals(entries, now).map((entry) => entry.id)).toEqual(['today', 'older']);
});
