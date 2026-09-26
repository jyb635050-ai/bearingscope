import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import { z, ZodError } from 'zod';
import type {
  ApiErrorResponse,
  BrandAttention,
  BrandsResponse,
  ContentCategory,
  FeedFilters,
  FeedItem,
  FeedResponse,
  FeedSort,
  FeedTimeRange,
  MarketResponse,
  Pagination,
  ResearchResponse,
  ResearchSort,
  SourceType,
  SourcesResponse,
  TrendingResponse,
  WechatImportResponse,
} from '../src/shared/types';
import { brands, marketItems, newsItems, researchItems, sources } from './data';
import { deduplicateContent } from './dedupe';

const DEMO_NOW = new Date('2026-07-11T12:00:00.000Z');
const CONTENT_CATEGORIES = [
  'company',
  'finance',
  'listing',
  'product',
  'technology',
  'market',
  'capacity',
  'loss',
  'merger',
  'restructuring',
  'supply-chain',
] as const satisfies readonly ContentCategory[];
const SOURCE_TYPES = ['official', 'rss', 'wechat', 'journal', 'regulator', 'wire', 'demo'] as const satisfies readonly SourceType[];
const FEED_TIMES = ['24h', '7d', '30d', 'all'] as const satisfies readonly FeedTimeRange[];
const FEED_SORTS = ['newest', 'oldest', 'relevance', 'confidence'] as const satisfies readonly FeedSort[];
const RESEARCH_SORTS = ['newest', 'oldest', 'citations'] as const satisfies readonly ResearchSort[];

const optionalQueryString = z.preprocess(
  (value) => (Array.isArray(value) ? value.join(',') : value),
  z.string().trim().optional(),
);

function commaSeparatedEnum<T extends [string, ...string[]]>(values: T) {
  return optionalQueryString
    .transform((value) => (value ? value.split(',').map((entry) => entry.trim()).filter(Boolean) : []))
    .pipe(z.array(z.enum(values)));
}

const pageFields = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
};

const feedQuerySchema = z.object({
  q: optionalQueryString.transform((value) => value ?? ''),
  category: commaSeparatedEnum([...CONTENT_CATEGORIES]),
  brand: optionalQueryString.transform((value) => (value ? value.split(',').map((entry) => entry.trim()).filter(Boolean) : [])),
  region: optionalQueryString.transform((value) => (value ? value.split(',').map((entry) => entry.trim()).filter(Boolean) : [])),
  sourceType: commaSeparatedEnum([...SOURCE_TYPES]),
  time: z.enum(FEED_TIMES).default('all'),
  sort: z.enum(FEED_SORTS).default('newest'),
  ...pageFields,
});

const researchQuerySchema = z.object({
  q: optionalQueryString.transform((value) => value ?? ''),
  brand: optionalQueryString.transform((value) => (value ? value.split(',').map((entry) => entry.trim()).filter(Boolean) : [])),
  openAccess: z.enum(['true', 'false']).optional().transform((value) => (value === undefined ? undefined : value === 'true')),
  sort: z.enum(RESEARCH_SORTS).default('newest'),
  ...pageFields,
});

const marketQuerySchema = z.object({
  horizon: commaSeparatedEnum(['near', 'mid', 'long']),
  maturity: commaSeparatedEnum(['emerging', 'scaling', 'established']),
});

const sourcesQuerySchema = z.object({
  type: commaSeparatedEnum([...SOURCE_TYPES]),
});

const wechatImportSchema = z.object({
  url: z.string().url().max(2_048),
  title: z.string().trim().min(1).max(300).optional(),
  brandId: z.string().trim().min(1).optional(),
}).strict();

function pageOf<T>(items: readonly T[], page: number, pageSize: number): { items: T[]; pagination: Pagination } {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  return {
    items: items.slice(offset, offset + pageSize),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    },
  };
}

function searchableText(item: FeedItem): string {
  return [
    item.title.zh,
    item.title.en,
    item.originalTitle,
    item.summary.zh,
    item.summary.en,
    item.source.name.zh,
    item.source.name.en,
    ...item.brandIds.flatMap((brandId) => {
      const brand = brands.find((candidate) => candidate.id === brandId);
      return brand ? [brand.shortName, ...brand.aliases] : [];
    }),
  ].join(' ').toLocaleLowerCase();
}

function relevance(item: FeedItem, query: string): number {
  if (!query.trim()) return 0;
  const needle = query.trim().toLocaleLowerCase();
  const title = `${item.title.zh} ${item.title.en} ${item.originalTitle}`.toLocaleLowerCase();
  const haystack = searchableText(item);
  return (title.includes(needle) ? 3 : 0) + (haystack.includes(needle) ? 1 : 0);
}

function cutoffFor(range: FeedTimeRange): number | undefined {
  const durations: Partial<Record<FeedTimeRange, number>> = {
    '24h': 24 * 60 * 60 * 1_000,
    '7d': 7 * 24 * 60 * 60 * 1_000,
    '30d': 30 * 24 * 60 * 60 * 1_000,
  };
  const duration = durations[range];
  return duration ? DEMO_NOW.getTime() - duration : undefined;
}

function validateBrandIds(ids: string[]): void {
  const known = new Set(brands.map((brand) => brand.id));
  const unknown = ids.filter((id) => !known.has(id));
  if (unknown.length) {
    throw new ZodError(unknown.map((id) => ({
      code: 'custom',
      path: ['brand'],
      message: `Unknown brand id: ${id}`,
    })));
  }
}

export function isValidWechatArticleUrl(input: string): boolean {
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'mp.weixin.qq.com') return false;
    if (url.username || url.password) return false;
    if (url.pathname === '/s') return url.searchParams.size > 0;
    return url.pathname.startsWith('/s/') && url.pathname.length > 3;
  } catch {
    return false;
  }
}

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/v1/feed', asyncRoute((_request, response) => {
    const query = feedQuerySchema.parse(_request.query);
    validateBrandIds(query.brand);
    const filters: FeedFilters = {
      q: query.q,
      categories: query.category,
      brandIds: query.brand,
      regions: query.region,
      sourceTypes: query.sourceType,
      time: query.time,
      sort: query.sort,
    };
    const cutoff = cutoffFor(query.time);
    const normalizedQuery = query.q.toLocaleLowerCase();

    const filtered = deduplicateContent(newsItems).filter((item) => {
      if (normalizedQuery && !searchableText(item).includes(normalizedQuery)) return false;
      if (query.category.length && !query.category.some((category) => item.categories.includes(category))) return false;
      if (query.brand.length && !query.brand.some((brandId) => item.brandIds.includes(brandId))) return false;
      if (query.region.length && !query.region.some((region) => item.region.toLocaleLowerCase() === region.toLocaleLowerCase())) return false;
      if (query.sourceType.length && !query.sourceType.includes(item.source.type)) return false;
      if (cutoff !== undefined && Date.parse(item.publishedAt) < cutoff) return false;
      return true;
    });

    filtered.sort((left, right) => {
      if (query.sort === 'oldest') return Date.parse(left.publishedAt) - Date.parse(right.publishedAt);
      if (query.sort === 'confidence') return right.confidence - left.confidence || Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
      if (query.sort === 'relevance') return relevance(right, query.q) - relevance(left, query.q) || Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
      return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
    });

    const paged = pageOf(filtered, query.page, query.pageSize);
    const body: FeedResponse = { ...paged, filters, demo: true };
    response.json(body);
  }));

  app.get('/api/v1/trending', (_request, response) => {
    const feed = deduplicateContent(newsItems);
    const topics = feed.slice(0, 5).map((item, index) => ({
      rank: index + 1,
      itemId: item.id,
      title: item.title,
      url: item.url ?? item.canonicalUrl,
      mentions: 20 - index * 3,
      sourceCount: Math.max(2, 6 - index),
      lastUpdatedAt: item.fetchedAt,
    }));
    const brandAttention: BrandAttention[] = brands.map((brand, index) => ({
      brandId: brand.id,
      mentions: feed.filter((item) => item.brandIds.includes(brand.id)).length,
      change7d: 10 - index * 2,
    }));
    const body: TrendingResponse = {
      topics,
      brandAttention,
      generatedAt: DEMO_NOW.toISOString(),
      demo: true,
    };
    response.json(body);
  });

  app.get('/api/v1/brands', (_request, response) => {
    const feed = deduplicateContent(newsItems);
    const body: BrandsResponse = {
      items: brands.map((brand) => {
        const related = feed.filter((item) => item.brandIds.includes(brand.id));
        return {
          brand,
          mentionCount: related.length,
          latestItems: related.slice(0, 3),
        };
      }),
      disclaimer: {
        zh: '这是可配置的品牌关注名单，不构成有市场份额依据的全球排名。',
        en: 'This is a configurable brand watch list, not a market-share-based global ranking.',
      },
      demo: true,
    };
    response.json(body);
  });

  app.get('/api/v1/market', asyncRoute((request, response) => {
    const query = marketQuerySchema.parse(request.query);
    const items = deduplicateContent(marketItems).filter((item) => {
      if (query.horizon.length && !query.horizon.includes(item.horizon)) return false;
      if (query.maturity.length && !query.maturity.includes(item.maturity)) return false;
      return true;
    });
    const body: MarketResponse = {
      items,
      generatedAt: DEMO_NOW.toISOString(),
      demo: true,
    };
    response.json(body);
  }));

  app.get('/api/v1/research', asyncRoute((request, response) => {
    const query = researchQuerySchema.parse(request.query);
    validateBrandIds(query.brand);
    const needle = query.q.toLocaleLowerCase();
    const filtered = deduplicateContent(researchItems).filter((item) => {
      const searchText = [item.title.zh, item.title.en, item.originalTitle, item.summary.zh, item.summary.en, item.journal, ...item.authors].join(' ').toLocaleLowerCase();
      if (needle && !searchText.includes(needle)) return false;
      if (query.brand.length && !query.brand.some((brandId) => item.brandIds.includes(brandId))) return false;
      if (query.openAccess !== undefined && item.openAccess !== query.openAccess) return false;
      return true;
    });
    filtered.sort((left, right) => {
      if (query.sort === 'oldest') return Date.parse(left.publishedAt) - Date.parse(right.publishedAt);
      if (query.sort === 'citations') return right.citations - left.citations || Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
      return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
    });
    const paged = pageOf(filtered, query.page, query.pageSize);
    const body: ResearchResponse = { ...paged, demo: true };
    response.json(body);
  }));

  app.get('/api/v1/sources', asyncRoute((request, response) => {
    const query = sourcesQuerySchema.parse(request.query);
    const body: SourcesResponse = {
      items: query.type.length ? sources.filter((source) => query.type.includes(source.type)) : sources,
      demo: true,
    };
    response.json(body);
  }));

  app.post('/api/v1/imports/wechat', asyncRoute((request, response) => {
    const item = wechatImportSchema.parse(request.body);
    if (item.brandId) validateBrandIds([item.brandId]);
    if (!isValidWechatArticleUrl(item.url)) {
      const body: ApiErrorResponse = {
        error: {
          code: 'INVALID_WECHAT_URL',
          message: 'URL must be a public HTTPS article URL on mp.weixin.qq.com/s.',
        },
      };
      response.status(400).json(body);
      return;
    }
    const body: WechatImportResponse = {
      status: 'queued',
      requestId: randomUUID(),
      submittedAt: new Date().toISOString(),
      item,
    };
    response.status(202).json(body);
  }));

  const webDist = resolve(process.cwd(), 'dist');
  if (existsSync(webDist)) {
    app.use(express.static(webDist, { index: false }));
    app.get(/.*/, (request, response, next) => {
      if (request.path.startsWith('/api/')) {
        next();
        return;
      }
      response.sendFile(resolve(webDist, 'index.html'));
    });
  }

  app.use((_request, response) => {
    const body: ApiErrorResponse = {
      error: { code: 'NOT_FOUND', message: 'API route not found.' },
    };
    response.status(404).json(body);
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof ZodError) {
      const body: ApiErrorResponse = {
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request parameters are invalid.',
          details: error.flatten(),
        },
      };
      response.status(400).json(body);
      return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
      const body: ApiErrorResponse = {
        error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
      };
      response.status(400).json(body);
      return;
    }

    const body: ApiErrorResponse = {
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    };
    response.status(500).json(body);
  };
  app.use(errorHandler);

  return app;
}

export const app = createApp();
