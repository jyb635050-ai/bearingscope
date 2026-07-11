import type { ContentItem } from '../../src/shared/types';
import { canonicalizeUrl } from '../dedupe';

export interface AdapterFetchRequest {
  cursor?: string;
  limit?: number;
}

export interface AdapterFetchResult<TRaw> {
  records: TRaw[];
  nextCursor?: string;
}

export interface SourceHealth {
  status: 'healthy' | 'degraded' | 'offline';
  checkedAt: string;
  message?: string;
}

/** Contract implemented by future RSS, GDELT, OpenAlex, and licensed adapters. */
export interface SourceAdapter<TRaw = unknown> {
  readonly id: string;
  fetch(request?: AdapterFetchRequest): Promise<AdapterFetchResult<TRaw>>;
  normalize(record: TRaw): ContentItem | null;
  health(): Promise<SourceHealth>;
}

/**
 * V1's only active adapter. It reads a supplied in-memory fixture and therefore
 * cannot initiate an external network request.
 */
export class SampleSourceAdapter implements SourceAdapter<ContentItem> {
  readonly id = 'sample-fixture';

  constructor(private readonly fixtures: readonly ContentItem[]) {}

  async fetch(request: AdapterFetchRequest = {}): Promise<AdapterFetchResult<ContentItem>> {
    const offset = Math.max(0, Number.parseInt(request.cursor ?? '0', 10) || 0);
    const limit = Math.min(100, Math.max(1, request.limit ?? 20));
    const records = this.fixtures.slice(offset, offset + limit).map((item) => structuredClone(item));
    const nextOffset = offset + records.length;
    return {
      records,
      ...(nextOffset < this.fixtures.length ? { nextCursor: String(nextOffset) } : {}),
    };
  }

  normalize(record: ContentItem): ContentItem {
    return {
      ...structuredClone(record),
      canonicalUrl: canonicalizeUrl(record.canonicalUrl ?? record.url),
    };
  }

  async health(): Promise<SourceHealth> {
    return {
      status: 'healthy',
      checkedAt: new Date().toISOString(),
      message: 'Serving local demo fixtures; external access is disabled.',
    };
  }
}
