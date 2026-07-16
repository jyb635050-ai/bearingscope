const HAN_TEXT = /[\u3400-\u9fff]/u;
const TRANSLATION_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const BRAND_TERMS = [
  'MinebeaMitsumi',
  'NBC Bearings',
  'Schaeffler',
  'Timken',
  'JTEKT',
  'Koyo',
  'NACHI',
  'SKF',
  'NSK',
  'NTN',
  'C&U',
  'ZWZ',
] as const;

type Fetcher = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface TitleTranslationResult {
  translations: Map<string, string>;
  requestedCount: number;
  cacheHitCount: number;
  unresolved: string[];
}

export function normalizeTitleKey(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

export function hasChineseText(value: string): boolean {
  return HAN_TEXT.test(value);
}

export function isValidChineseTranslation(original: string, translated: string): boolean {
  const normalizedTranslation = translated.replace(/\s+/g, ' ').trim();
  if (!hasChineseText(normalizedTranslation)) return false;
  if (!hasChineseText(original) && normalizeTitleKey(original) === normalizeTitleKey(normalizedTranslation)) return false;
  return true;
}

interface SnapshotTitleItem {
  originalTitle?: unknown;
  title?: { zh?: unknown };
}

export function extractTranslationCache(...snapshots: unknown[]): Map<string, string> {
  const cache = new Map<string, string>();
  for (const snapshot of snapshots) {
    if (!snapshot || typeof snapshot !== 'object') continue;
    const candidate = snapshot as Record<string, unknown>;
    for (const collectionName of ['feedItems', 'researchItems', 'marketItems']) {
      const collection = candidate[collectionName];
      if (!Array.isArray(collection)) continue;
      for (const rawItem of collection) {
        if (!rawItem || typeof rawItem !== 'object') continue;
        const item = rawItem as SnapshotTitleItem;
        const original = typeof item.originalTitle === 'string' ? item.originalTitle.trim() : '';
        const translated = typeof item.title?.zh === 'string' ? item.title.zh.trim() : '';
        if (original && isValidChineseTranslation(original, translated)) {
          cache.set(normalizeTitleKey(original), translated);
        }
      }
    }
  }
  return cache;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function protectBrandTerms(value: string): { text: string; restore: (translated: string) => string } {
  const replacements: Array<{ token: string; value: string }> = [];
  const pattern = new RegExp(BRAND_TERMS.map(escapeRegExp).join('|'), 'gi');
  const protectedText = value.replace(pattern, (match) => {
    const token = `__BSBRAND${String(replacements.length).padStart(3, '0')}__`;
    replacements.push({ token, value: match });
    return token;
  });
  return {
    text: protectedText,
    restore: (translated) => replacements.reduce(
      (current, replacement) => current.replace(new RegExp(escapeRegExp(replacement.token), 'gi'), replacement.value),
      translated,
    ),
  };
}

async function requestGoogleTranslation(payload: string, fetcher: Fetcher): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const url = new URL(TRANSLATION_ENDPOINT);
      url.searchParams.set('client', 'gtx');
      url.searchParams.set('sl', 'auto');
      url.searchParams.set('tl', 'zh-CN');
      url.searchParams.set('dt', 't');
      url.searchParams.set('q', payload);
      const response = await fetcher(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'BearingScope/1.1' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Translation service returned HTTP ${response.status}.`);
      const body = await response.json() as unknown;
      if (!Array.isArray(body) || !Array.isArray(body[0])) throw new Error('Translation service returned an unexpected response.');
      const translated = body[0]
        .map((segment) => Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : '')
        .join('')
        .trim();
      if (!translated) throw new Error('Translation service returned an empty result.');
      return translated;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 700 * 2 ** (attempt - 1)));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Translation request failed.');
}

interface PendingTitle {
  original: string;
  key: string;
}

function createBatches(items: PendingTitle[], maxItems = 6, maxCharacters = 1_500): PendingTitle[][] {
  const batches: PendingTitle[][] = [];
  let current: PendingTitle[] = [];
  let length = 0;
  for (const item of items) {
    const nextLength = item.original.length + 16;
    if (current.length && (current.length >= maxItems || length + nextLength > maxCharacters)) {
      batches.push(current);
      current = [];
      length = 0;
    }
    current.push(item);
    length += nextLength;
  }
  if (current.length) batches.push(current);
  return batches;
}

async function translateSingle(item: PendingTitle, fetcher: Fetcher): Promise<string | undefined> {
  const protectedTitle = protectBrandTerms(item.original);
  try {
    const translated = protectedTitle.restore(await requestGoogleTranslation(protectedTitle.text, fetcher));
    return isValidChineseTranslation(item.original, translated) ? translated.replace(/\s+/g, ' ').trim() : undefined;
  } catch {
    return undefined;
  }
}

async function translateBatch(items: PendingTitle[], fetcher: Fetcher): Promise<Map<string, string>> {
  const protectedItems = items.map((item, index) => ({
    ...item,
    marker: `[BS${String(index).padStart(4, '0')}]`,
    protectedTitle: protectBrandTerms(item.original),
  }));
  const payload = protectedItems.map((item) => `${item.marker}\n${item.protectedTitle.text}`).join('\n');
  const translatedPayload = await requestGoogleTranslation(payload, fetcher);
  const markerPattern = /\[BS(\d{4})\]/g;
  const markers = [...translatedPayload.matchAll(markerPattern)];
  if (markers.length !== items.length) throw new Error('Translation batch markers were not preserved.');

  const translations = new Map<string, string>();
  for (let markerIndex = 0; markerIndex < markers.length; markerIndex += 1) {
    const marker = markers[markerIndex];
    const sourceIndex = Number(marker[1]);
    const source = protectedItems[sourceIndex];
    if (!source || marker.index === undefined) continue;
    const start = marker.index + marker[0].length;
    const end = markers[markerIndex + 1]?.index ?? translatedPayload.length;
    const translated = source.protectedTitle.restore(translatedPayload.slice(start, end).trim()).replace(/\s+/g, ' ').trim();
    if (isValidChineseTranslation(source.original, translated)) translations.set(source.key, translated);
  }
  return translations;
}

export async function translateMissingTitles(
  titles: string[],
  existingCache = new Map<string, string>(),
  fetcher: Fetcher = fetch,
): Promise<TitleTranslationResult> {
  const translations = new Map(existingCache);
  const unique = new Map<string, PendingTitle>();
  let cacheHitCount = 0;

  for (const rawTitle of titles) {
    const original = rawTitle.replace(/\s+/g, ' ').trim();
    if (!original) continue;
    const key = normalizeTitleKey(original);
    if (hasChineseText(original)) {
      translations.set(key, original);
      cacheHitCount += 1;
    } else if (isValidChineseTranslation(original, translations.get(key) ?? '')) {
      cacheHitCount += 1;
    } else {
      translations.delete(key);
      unique.set(key, { original, key });
    }
  }

  const pending = [...unique.values()];
  const batches = createBatches(pending);
  let cursor = 0;
  const worker = async () => {
    while (cursor < batches.length) {
      const batch = batches[cursor];
      cursor += 1;
      let batchTranslations = new Map<string, string>();
      try {
        batchTranslations = await translateBatch(batch, fetcher);
      } catch {
        // A malformed or throttled batch falls back to isolated requests so one bad title cannot poison the batch.
      }
      for (const [key, translated] of batchTranslations) translations.set(key, translated);
      for (const item of batch) {
        if (translations.has(item.key)) continue;
        const translated = await translateSingle(item, fetcher);
        if (translated) translations.set(item.key, translated);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(2, batches.length) }, worker));

  const unresolved = pending.filter((item) => !translations.has(item.key)).map((item) => item.original);
  return { translations, requestedCount: pending.length, cacheHitCount, unresolved };
}
