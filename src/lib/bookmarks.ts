import { useCallback, useEffect, useState } from 'react';

export const BOOKMARKS_KEY = 'bearingscope:bookmarks:v1';
const BOOKMARKS_EVENT = 'bearingscope:bookmarks-changed';

function storageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadBookmarks(): string[] {
  if (!storageAvailable()) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((value): value is string => typeof value === 'string' && value.length > 0))]
      : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(ids: Iterable<string>): string[] {
  const normalized = [...new Set(ids)].filter(Boolean);
  if (storageAvailable()) {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent(BOOKMARKS_EVENT, { detail: normalized }));
    } catch {
      // Private browsing or storage policies may reject writes; keep the caller state usable.
    }
  }
  return normalized;
}

export function isBookmarked(id: string, ids = loadBookmarks()): boolean {
  return ids.includes(id);
}

export function toggleBookmark(id: string, ids = loadBookmarks()): string[] {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return saveBookmarks(next);
}

export function clearBookmarks(): void {
  saveBookmarks([]);
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>(loadBookmarks);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => setIds(loadBookmarks());
    window.addEventListener('storage', sync);
    window.addEventListener(BOOKMARKS_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(BOOKMARKS_EVENT, sync);
    };
  }, []);

  const toggle = useCallback((id: string) => setIds((current) => toggleBookmark(id, current)), []);
  const clear = useCallback(() => setIds(saveBookmarks([])), []);

  return { ids, bookmarked: new Set(ids), toggle, clear };
}
