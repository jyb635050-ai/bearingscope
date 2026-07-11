import type { ContentItem, ResearchItem, SourceTier } from '../src/shared/types';

const TRACKING_PARAMETERS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'spm',
]);

const SOURCE_PRIORITY: Record<SourceTier, number> = {
  official: 4,
  academic: 3,
  primary: 2,
  secondary: 1,
};

export function canonicalizeUrl(input?: string): string | undefined {
  if (!input?.trim()) return undefined;

  try {
    const parsed = new URL(input.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;

    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    if ((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80')) {
      parsed.port = '';
    }

    for (const key of [...parsed.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || TRACKING_PARAMETERS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }

    parsed.searchParams.sort();
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function normalizeDoi(input?: string): string | undefined {
  if (!input?.trim()) return undefined;
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/^doi:\s*/, '')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
    .replace(/[?#].*$/, '');
  return normalized || undefined;
}

export function fingerprintTitle(input: string): string {
  return input
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[\p{P}\p{S}\s]+/gu, '');
}

function doiOf(item: ContentItem): string | undefined {
  return item.kind === 'research' ? normalizeDoi(item.doi) : undefined;
}

function titleFingerprintOf(item: ContentItem): string {
  return fingerprintTitle(item.originalTitle || item.title.en || item.title.zh);
}

function withinTitleWindow(left: ContentItem, right: ContentItem): boolean {
  const leftTime = Date.parse(left.publishedAt);
  const rightTime = Date.parse(right.publishedAt);
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return false;
  return Math.abs(leftTime - rightTime) <= 48 * 60 * 60 * 1_000;
}

function isDuplicate(left: ContentItem, right: ContentItem): boolean {
  const leftDoi = doiOf(left);
  const rightDoi = doiOf(right);
  if (leftDoi && rightDoi) return leftDoi === rightDoi;

  const leftUrl = canonicalizeUrl(left.canonicalUrl ?? left.url);
  const rightUrl = canonicalizeUrl(right.canonicalUrl ?? right.url);
  if (leftUrl && rightUrl) return leftUrl === rightUrl;

  // A title/time comparison is the fallback whenever either record lacks a
  // stable identifier. It intentionally never collapses two distinct URLs.
  if (leftUrl && rightUrl) return false;
  return titleFingerprintOf(left) === titleFingerprintOf(right) && withinTitleWindow(left, right);
}

export function compareSourcePriority(left: ContentItem, right: ContentItem): number {
  const tierDifference = SOURCE_PRIORITY[left.source.tier] - SOURCE_PRIORITY[right.source.tier];
  if (tierDifference !== 0) return tierDifference;
  return left.confidence - right.confidence;
}

function normalizeItem<T extends ContentItem>(item: T): T {
  const normalizedUrl = canonicalizeUrl(item.canonicalUrl ?? item.url);
  const normalized = {
    ...item,
    canonicalUrl: normalizedUrl,
    relatedSourceUrls: [...new Set(item.relatedSourceUrls.map(canonicalizeUrl).filter(Boolean))] as string[],
  } as T;

  if (normalized.kind === 'research') {
    (normalized as ResearchItem).doi = normalizeDoi((normalized as ResearchItem).doi);
  }
  return normalized;
}

function mergeRecords<T extends ContentItem>(preferred: T, other: T): T {
  const related = [
    ...preferred.relatedSourceUrls,
    ...other.relatedSourceUrls,
    other.url,
  ]
    .map(canonicalizeUrl)
    .filter((url): url is string => Boolean(url))
    .filter((url) => url !== preferred.canonicalUrl);

  return {
    ...preferred,
    relatedSourceUrls: [...new Set(related)],
  };
}

/**
 * De-duplicate without mutating inputs. DOI and canonical URL are authoritative;
 * title fingerprints are only used when a stable identifier is absent.
 */
export function deduplicateContent<T extends ContentItem>(input: readonly T[]): T[] {
  const result: T[] = [];

  for (const rawItem of input) {
    const item = normalizeItem(rawItem);
    const duplicateIndex = result.findIndex((candidate) => isDuplicate(candidate, item));
    if (duplicateIndex < 0) {
      result.push(item);
      continue;
    }

    const existing = result[duplicateIndex];
    if (compareSourcePriority(item, existing) > 0) {
      result[duplicateIndex] = mergeRecords(item, existing);
    } else {
      result[duplicateIndex] = mergeRecords(existing, item);
    }
  }

  return result;
}
