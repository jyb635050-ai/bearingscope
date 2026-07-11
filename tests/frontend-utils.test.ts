import { beforeEach, describe, expect, it } from 'vitest';
import { BOOKMARKS_KEY, clearBookmarks, loadBookmarks, toggleBookmark } from '../src/lib/bookmarks';
import { DEFAULT_FEED_FILTERS, parseFeedSearch, parsePage, serializeFeedSearch } from '../src/lib/feedUrlState';
import { localize } from '../src/lib/i18n';

describe('frontend localization and URL state', () => {
  it('selects the requested localized text', () => {
    expect(localize({ zh: '轴承', en: 'Bearing' }, 'zh')).toBe('轴承');
    expect(localize({ zh: '轴承', en: 'Bearing' }, 'en')).toBe('Bearing');
  });

  it('round-trips non-default feed filters and sanitizes page values', () => {
    const filters = { ...DEFAULT_FEED_FILTERS, q: 'ceramic', category: 'technology', time: '7d' as const };
    const params = serializeFeedSearch(filters, 3);
    expect(params.toString()).toContain('q=ceramic');
    expect(parseFeedSearch(params)).toEqual(filters);
    expect(parsePage(params)).toBe(3);
    expect(parsePage(new URLSearchParams('page=-4'))).toBe(1);
  });
});

describe('browser-local bookmarks', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deduplicates stored IDs and recovers from invalid storage', () => {
    window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(['a', 'a', '', 3, 'b']));
    expect(loadBookmarks()).toEqual(['a', 'b']);
    window.localStorage.setItem(BOOKMARKS_KEY, '{broken');
    expect(loadBookmarks()).toEqual([]);
  });

  it('toggles and clears bookmarks persistently', () => {
    expect(toggleBookmark('paper-1', [])).toEqual(['paper-1']);
    expect(loadBookmarks()).toEqual(['paper-1']);
    expect(toggleBookmark('paper-1')).toEqual([]);
    toggleBookmark('news-1');
    clearBookmarks();
    expect(loadBookmarks()).toEqual([]);
  });
});
