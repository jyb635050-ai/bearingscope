import { brands, marketItems, newsItems, researchItems, sources } from '../../server/data';
import { deduplicateContent } from '../../server/dedupe';
import type {
  BrandAttention,
  BrandsResponse,
  FeedFilters,
  FeedItem,
  FeedResponse,
  MarketResponse,
  Pagination,
  ResearchResponse,
  SourcesResponse,
  TrendingResponse,
  WechatImportResponse,
} from '../shared/types';
import type { FeedParams, ResearchParams, WechatImportInput } from './api';

const DEMO_NOW = new Date('2026-07-11T12:00:00.000Z');

function pageOf<T>(items: T[], page = 1, pageSize = 20): { items: T[]; pagination: Pagination } {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize);
  const offset = (safePage - 1) * safePageSize;
  return {
    items: items.slice(offset, offset + safePageSize),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1 && totalPages > 0,
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

function feed(params: FeedParams = {}): Promise<FeedResponse> {
  const q = params.q?.trim().toLocaleLowerCase() ?? '';
  const cutoffHours = params.time === '24h' ? 24 : params.time === '7d' ? 168 : params.time === '30d' ? 720 : undefined;
  const cutoff = cutoffHours ? DEMO_NOW.getTime() - cutoffHours * 60 * 60 * 1_000 : undefined;
  const items = deduplicateContent(newsItems).filter((item) => {
    if (q && !searchableText(item).includes(q)) return false;
    if (params.category && !item.categories.includes(params.category as never)) return false;
    if (params.brand && !item.brandIds.includes(params.brand)) return false;
    if (params.region && item.region.toLocaleLowerCase() !== params.region.toLocaleLowerCase()) return false;
    if (params.sourceType && item.source.type !== params.sourceType) return false;
    if (cutoff && Date.parse(item.publishedAt) < cutoff) return false;
    return true;
  });

  items.sort((left, right) => {
    if (params.sort === 'oldest') return Date.parse(left.publishedAt) - Date.parse(right.publishedAt);
    if (params.sort === 'confidence') return right.confidence - left.confidence;
    if (params.sort === 'relevance' && q) return Number(searchableText(right).includes(q)) - Number(searchableText(left).includes(q));
    return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
  });

  const filters: FeedFilters = {
    q: params.q ?? '',
    categories: params.category ? [params.category as never] : [],
    brandIds: params.brand ? [params.brand] : [],
    regions: params.region ? [params.region] : [],
    sourceTypes: params.sourceType ? [params.sourceType as never] : [],
    time: params.time ?? 'all',
    sort: params.sort ?? 'newest',
  };
  return Promise.resolve({ ...pageOf(items, params.page, params.pageSize), filters, demo: true });
}

function trending(): Promise<TrendingResponse> {
  const items = deduplicateContent(newsItems);
  const brandAttention: BrandAttention[] = brands.map((brand, index) => ({
    brandId: brand.id,
    mentions: items.filter((item) => item.brandIds.includes(brand.id)).length,
    change7d: 10 - index * 2,
  }));
  return Promise.resolve({
    topics: items.slice(0, 5).map((item, index) => ({
      rank: index + 1,
      itemId: item.id,
      title: item.title,
      mentions: 20 - index * 3,
      sourceCount: Math.max(2, 6 - index),
      lastUpdatedAt: item.fetchedAt,
    })),
    brandAttention,
    generatedAt: DEMO_NOW.toISOString(),
    demo: true,
  });
}

function brandList(): Promise<BrandsResponse> {
  const items = deduplicateContent(newsItems);
  return Promise.resolve({
    items: brands.map((brand) => {
      const related = items.filter((item) => item.brandIds.includes(brand.id));
      return { brand, mentionCount: related.length, latestItems: related.slice(0, 3) };
    }),
    disclaimer: {
      zh: '这是可配置的品牌关注名单，不构成有市场份额依据的全球排名。',
      en: 'This is a configurable brand watch list, not a market-share-based global ranking.',
    },
    demo: true,
  });
}

function market(): Promise<MarketResponse> {
  return Promise.resolve({ items: deduplicateContent(marketItems), generatedAt: DEMO_NOW.toISOString(), demo: true });
}

function research(params: ResearchParams = {}): Promise<ResearchResponse> {
  const q = params.q?.trim().toLocaleLowerCase() ?? '';
  const items = deduplicateContent(researchItems).filter((item) => {
    const haystack = [item.title.zh, item.title.en, item.originalTitle, item.summary.zh, item.summary.en, item.journal, ...item.authors].join(' ').toLocaleLowerCase();
    if (q && !haystack.includes(q)) return false;
    if (params.brand && !item.brandIds.includes(params.brand)) return false;
    if (params.openAccess !== undefined && item.openAccess !== params.openAccess) return false;
    return true;
  });
  items.sort((left, right) => {
    if (params.sort === 'oldest') return Date.parse(left.publishedAt) - Date.parse(right.publishedAt);
    if (params.sort === 'citations') return right.citations - left.citations;
    return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
  });
  return Promise.resolve({ ...pageOf(items, params.page, params.pageSize), demo: true });
}

function importWechat(input: WechatImportInput): Promise<WechatImportResponse> {
  if (!/^https:\/\/mp\.weixin\.qq\.com\/s(?:\/|\?)/i.test(input.url)) {
    return Promise.reject(new Error('URL must be a public HTTPS article URL on mp.weixin.qq.com/s.'));
  }
  return Promise.resolve({
    status: 'queued',
    requestId: globalThis.crypto?.randomUUID?.() ?? `wechat-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    item: input,
  });
}

export const staticBearingApi = {
  feed,
  trending,
  brands: brandList,
  market,
  research,
  sources: (): Promise<SourcesResponse> => Promise.resolve({ items: sources, demo: true }),
  importWechat,
};
