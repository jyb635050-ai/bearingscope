import type {
  BrandsResponse,
  FeedResponse,
  MarketResponse,
  ResearchResponse,
  SourcesResponse,
  TrendingResponse,
} from '../shared/types';
import { staticBearingApi } from './staticApi';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ParamValue = string | number | boolean | undefined | null;

export interface FeedParams {
  q?: string;
  category?: string;
  brand?: string;
  region?: string;
  sourceType?: string;
  time?: '24h' | '7d' | '30d' | 'all';
  sort?: 'newest' | 'oldest' | 'relevance' | 'confidence';
  page?: number;
  pageSize?: number;
}

export interface ResearchParams {
  q?: string;
  brand?: string;
  openAccess?: boolean;
  sort?: 'newest' | 'oldest' | 'citations';
  page?: number;
  pageSize?: number;
}

export interface WechatImportInput {
  url: string;
  title?: string;
  brandId?: string;
}

export interface WechatImportResponse {
  status: 'queued';
  requestId: string;
  submittedAt: string;
  item: Pick<WechatImportInput, 'url' | 'title' | 'brandId'>;
}

function withQuery<T extends object>(path: string, params: T): string {
  const query = new URLSearchParams();
  (Object.entries(params) as [string, ParamValue][]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      headers: { Accept: 'application/json', ...init?.headers },
      ...init,
    });
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Network request failed', 0);
  }

  const body = await response.json().catch(() => undefined);
  if (!response.ok) {
    const directMessage =
      body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' ? body.message : undefined;
    const nestedMessage =
      body &&
      typeof body === 'object' &&
      'error' in body &&
      body.error &&
      typeof body.error === 'object' &&
      'message' in body.error &&
      typeof body.error.message === 'string'
        ? body.error.message
        : undefined;
    const message = directMessage ?? nestedMessage ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status, body);
  }
  return body as T;
}

const liveBearingApi = {
  feed: (params: FeedParams = {}) => request<FeedResponse>(withQuery('/api/v1/feed', params)),
  trending: () => request<TrendingResponse>('/api/v1/trending'),
  brands: () => request<BrandsResponse>('/api/v1/brands'),
  market: () => request<MarketResponse>('/api/v1/market'),
  research: (params: ResearchParams = {}) => request<ResearchResponse>(withQuery('/api/v1/research', params)),
  sources: () => request<SourcesResponse>('/api/v1/sources'),
  importWechat: (input: WechatImportInput) =>
    request<WechatImportResponse>('/api/v1/imports/wechat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
};

export const bearingApi = import.meta.env.VITE_STATIC_DEMO === 'true' ? staticBearingApi : liveBearingApi;
