export type Locale = 'zh' | 'en';

export interface LocalizedText {
  zh: string;
  en: string;
}

export type ContentKind = 'news' | 'finance' | 'market' | 'research';

export type ContentCategory =
  | 'company'
  | 'finance'
  | 'listing'
  | 'product'
  | 'technology'
  | 'market'
  | 'capacity'
  | 'loss'
  | 'merger'
  | 'restructuring'
  | 'supply-chain';

export type SourceType =
  | 'official'
  | 'rss'
  | 'wechat'
  | 'journal'
  | 'regulator'
  | 'wire'
  | 'demo';

export type SourceTier = 'official' | 'primary' | 'academic' | 'secondary';

export interface SourceRecord {
  id: string;
  name: LocalizedText;
  type: SourceType;
  tier: SourceTier;
  verified: boolean;
  brandId?: string;
  homepage?: string;
  notes?: LocalizedText;
}

export interface Brand {
  id: string;
  slug: string;
  name: LocalizedText;
  shortName: string;
  country: LocalizedText;
  aliases: string[];
  /** This is a configurable editorial watch list, not an asserted market ranking. */
  attentionList: true;
  /** Display labels only. No unverified account IDs are stored. */
  wechatDisplayNames: string[];
}

export interface BaseContentItem {
  id: string;
  kind: ContentKind;
  demo: boolean;
  title: LocalizedText;
  originalTitle: string;
  summary: LocalizedText;
  keyFacts: LocalizedText[];
  brandIds: string[];
  region: string;
  categories: ContentCategory[];
  source: SourceRecord;
  originalLanguage: string;
  publishedAt: string;
  fetchedAt: string;
  url?: string;
  canonicalUrl?: string;
  confidence: number;
  relatedSourceUrls: string[];
}

export interface NewsItem extends BaseContentItem {
  kind: 'news';
  newsType: 'company' | 'product' | 'technology' | 'industry' | 'supply-chain';
}

export interface FinanceItem extends BaseContentItem {
  kind: 'finance';
  eventType: 'earnings' | 'listing' | 'stock-move' | 'merger' | 'loss' | 'restructuring';
  /** Demo data never contains invented issuer figures. */
  metrics: Record<string, string>;
}

export interface MarketItem extends BaseContentItem {
  kind: 'market';
  horizon: 'near' | 'mid' | 'long';
  maturity: 'emerging' | 'scaling' | 'established';
}

export interface ResearchItem extends BaseContentItem {
  kind: 'research';
  authors: string[];
  journal: string;
  doi?: string;
  citations: number;
  openAccess: boolean;
  paperUrl?: string;
}

export type ContentItem = NewsItem | FinanceItem | MarketItem | ResearchItem;
export type FeedItem = NewsItem | FinanceItem;

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type FeedTimeRange = '24h' | '7d' | '30d' | 'all';
export type FeedSort = 'newest' | 'oldest' | 'relevance' | 'confidence';

export interface FeedFilters {
  q: string;
  categories: ContentCategory[];
  brandIds: string[];
  regions: string[];
  sourceTypes: SourceType[];
  time: FeedTimeRange;
  sort: FeedSort;
}

export interface FeedResponse {
  items: FeedItem[];
  pagination: Pagination;
  filters: FeedFilters;
  demo: boolean;
}

export interface TrendingTopic {
  rank: number;
  itemId: string;
  title: LocalizedText;
  mentions: number;
  sourceCount: number;
  lastUpdatedAt: string;
}

export interface BrandAttention {
  brandId: string;
  mentions: number;
  change7d: number;
}

export interface TrendingResponse {
  topics: TrendingTopic[];
  brandAttention: BrandAttention[];
  generatedAt: string;
  demo: boolean;
}

export interface BrandWithActivity {
  brand: Brand;
  mentionCount: number;
  latestItems: FeedItem[];
}

export interface BrandsResponse {
  items: BrandWithActivity[];
  disclaimer: LocalizedText;
  demo: boolean;
}

export interface MarketResponse {
  items: MarketItem[];
  generatedAt: string;
  demo: boolean;
}

export type ResearchSort = 'newest' | 'oldest' | 'citations';

export interface ResearchResponse {
  items: ResearchItem[];
  pagination: Pagination;
  demo: boolean;
}

export interface SourcesResponse {
  items: SourceRecord[];
  demo: boolean;
}

export interface WechatImportRequest {
  url: string;
  title?: string;
  brandId?: string;
}

export interface WechatImportResponse {
  status: 'queued';
  requestId: string;
  submittedAt: string;
  item: WechatImportRequest;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
