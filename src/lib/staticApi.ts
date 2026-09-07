import { deduplicateContent } from '../../server/dedupe';
import { rankDailySignals } from '../shared/newsRanking';
import type {
  Brand,
  BrandAttention,
  BrandsResponse,
  FeedFilters,
  FeedItem,
  FeedResponse,
  LiveContentSnapshot,
  MarketResponse,
  Pagination,
  ResearchResponse,
  SourcesResponse,
  TrendingResponse,
  WechatImportResponse,
} from '../shared/types';
import type { FeedParams, ResearchParams, WechatImportInput } from './api';

let snapshotPromise: Promise<LiveContentSnapshot> | undefined;

function isLiveSnapshot(value: unknown): value is LiveContentSnapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LiveContentSnapshot>;
  return candidate.schemaVersion === 1
    && candidate.mode === 'live'
    && typeof candidate.generatedAt === 'string'
    && Array.isArray(candidate.feedItems)
    && Array.isArray(candidate.marketItems)
    && Array.isArray(candidate.researchItems)
    && Array.isArray(candidate.brands)
    && Array.isArray(candidate.sources)
    && Array.isArray(candidate.sourceHealth);
}

async function loadSnapshot(): Promise<LiveContentSnapshot> {
  if (!snapshotPromise) {
    snapshotPromise = (async () => {
      const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
      const response = await fetch(`${base}data/live-content.json`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`真实内容快照加载失败（HTTP ${response.status}）`);
      const body: unknown = await response.json();
      if (!isLiveSnapshot(body)) throw new Error('真实内容快照格式无效，已停止展示以避免用演示数据冒充。');
      return body;
    })().catch((error) => {
      snapshotPromise = undefined;
      throw error;
    });
  }
  return snapshotPromise;
}

/** Test-only cache reset; production code never swaps in demo fixtures. */
export function resetStaticSnapshotCache(): void {
  snapshotPromise = undefined;
}

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

function searchableText(item: FeedItem, brands: Brand[]): string {
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

async function feed(params: FeedParams = {}): Promise<FeedResponse> {
  const snapshot = await loadSnapshot();
  const q = params.q?.trim().toLocaleLowerCase() ?? '';
  const cutoffHours = params.time === '24h' ? 24 : params.time === '7d' ? 168 : params.time === '30d' ? 720 : undefined;
  const snapshotTime = Date.parse(snapshot.generatedAt);
  const cutoff = cutoffHours ? snapshotTime - cutoffHours * 60 * 60 * 1_000 : undefined;
  const items = deduplicateContent(snapshot.feedItems).filter((item) => {
    if (q && !searchableText(item, snapshot.brands).includes(q)) return false;
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
    if (params.sort === 'relevance' && q) return Number(searchableText(right, snapshot.brands).startsWith(q)) - Number(searchableText(left, snapshot.brands).startsWith(q));
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
  return { ...pageOf(items, params.page, params.pageSize), filters, demo: false };
}

function countBrandMentions(items: FeedItem[], brandId: string, from: number, to: number): number {
  return items.filter((item) => {
    const published = Date.parse(item.publishedAt);
    return item.brandIds.includes(brandId) && published >= from && published < to;
  }).length;
}

async function trending(): Promise<TrendingResponse> {
  const snapshot = await loadSnapshot();
  const items = deduplicateContent(snapshot.feedItems).sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
  const now = Date.parse(snapshot.generatedAt);
  const week = 7 * 24 * 60 * 60 * 1_000;
  const brandAttention: BrandAttention[] = snapshot.brands.map((brand) => {
    const current = countBrandMentions(items, brand.id, now - week, now + 1);
    const previous = countBrandMentions(items, brand.id, now - 2 * week, now - week);
    const change7d = previous ? Math.round(((current - previous) / previous) * 100) : current ? 100 : 0;
    return { brandId: brand.id, mentions: current, change7d };
  });
  return {
    topics: rankDailySignals(items, now).map((item, index) => ({
      rank: index + 1,
      itemId: item.id,
      title: item.title,
      mentions: 1,
      sourceCount: 1,
      lastUpdatedAt: item.publishedAt,
    })),
    brandAttention,
    generatedAt: snapshot.generatedAt,
    demo: false,
  };
}

async function brandList(): Promise<BrandsResponse> {
  const snapshot = await loadSnapshot();
  const items = deduplicateContent(snapshot.feedItems).sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
  return {
    items: snapshot.brands.map((brand) => {
      const related = items.filter((item) => item.brandIds.includes(brand.id));
      return { brand, mentionCount: related.length, latestItems: related.slice(0, 3) };
    }),
    disclaimer: {
      zh: '这是可配置的品牌关注名单，不构成有市场份额依据的全球排名；动态数量来自当前真实快照。',
      en: 'This is a configurable watch list, not a market-share ranking; activity counts come from the current live snapshot.',
    },
    demo: false,
  };
}

async function market(): Promise<MarketResponse> {
  const snapshot = await loadSnapshot();
  return { items: deduplicateContent(snapshot.marketItems), generatedAt: snapshot.generatedAt, demo: false };
}

async function research(params: ResearchParams = {}): Promise<ResearchResponse> {
  const snapshot = await loadSnapshot();
  const q = params.q?.trim().toLocaleLowerCase() ?? '';
  const items = deduplicateContent(snapshot.researchItems).filter((item) => {
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
  return { ...pageOf(items, params.page, params.pageSize), demo: false };
}

function importWechat(input: WechatImportInput): Promise<WechatImportResponse> {
  if (!/^https:\/\/mp\.weixin\.qq\.com\/s(?:\/|\?)/i.test(input.url)) {
    return Promise.reject(new Error('URL must be a public HTTPS article URL on mp.weixin.qq.com/s.'));
  }
  return Promise.reject(new Error('公开站点不伪造“已入队”状态：微信公众号文章需通过获授权接口、合规服务商或维护者审核后进入下一次快照。'));
}

export const staticBearingApi = {
  feed,
  trending,
  brands: brandList,
  market,
  research,
  sources: async (): Promise<SourcesResponse> => ({ items: (await loadSnapshot()).sources, demo: false }),
  importWechat,
};
