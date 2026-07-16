import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { brands as fixtureBrands } from '../server/data';
import type {
  Brand,
  ContentCategory,
  FeedItem,
  FinanceItem,
  LiveContentSnapshot,
  LocalizedText,
  MarketItem,
  NewsItem,
  ResearchItem,
  SnapshotSourceHealth,
  SourceRecord,
} from '../src/shared/types';
import {
  extractTranslationCache,
  isValidChineseTranslation,
  normalizeTitleKey,
  translateMissingTitles,
} from './title-translation';

const USER_AGENT = 'BearingScope/1.1 (+https://github.com/jyb635050-ai/bearingscope)';
const generatedAt = new Date().toISOString();
const today = generatedAt.slice(0, 10);
const fromDate = (() => {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - 2);
  return date.toISOString().slice(0, 10);
})();

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(projectRoot, 'public', 'data', 'live-content.json');
const deployedSnapshotUrl = process.env.BEARINGSCOPE_LIVE_SNAPSHOT_URL?.trim()
  || 'https://jyb635050-ai.github.io/bearingscope/data/live-content.json';
const text = (zh: string, en: string): LocalizedText => ({ zh, en });
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function hashId(prefix: string, input: string): string {
  return `${prefix}-${createHash('sha256').update(input).digest('hex').slice(0, 16)}`;
}

function normalizeSpace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function stripHtml(input: string): string {
  return normalizeSpace(
    input
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>'),
  );
}

function textOf(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return normalizeSpace(String(value));
  if (value && typeof value === 'object' && '#text' in value) {
    return textOf((value as { '#text'?: unknown })['#text']);
  }
  return '';
}

function safeIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(String(value));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

async function fetchText(url: string, attempts = 3): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json, application/rss+xml, application/xml, text/html, text/xml;q=0.9', 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      if (!response.ok) {
        const error = new Error(`${response.status} ${response.statusText} for ${new URL(url).hostname}`);
        if (response.status !== 429 && response.status < 500) throw error;
        lastError = error;
      } else {
        return await response.text();
      }
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < attempts) await wait(700 * 2 ** (attempt - 1));
  }
  throw lastError instanceof Error ? lastError : new Error(`Unable to fetch ${url}`);
}

const brandRules: Array<{ id: string; pattern: RegExp; ambiguous?: boolean }> = [
  { id: 'skf', pattern: /\bSKF\b/i },
  { id: 'schaeffler', pattern: /\bSchaeffler\b|舍弗勒/i },
  { id: 'timken', pattern: /\bTimken\b|铁姆肯/i },
  { id: 'nsk', pattern: /\bNSK\b/i, ambiguous: true },
  { id: 'ntn', pattern: /\bNTN\b/i, ambiguous: true },
  { id: 'jtekt-koyo', pattern: /\bJTEKT\b|\bKoyo\b|捷太格特|光洋/i },
  { id: 'minebeamitsumi', pattern: /\bMinebeaMitsumi\b|美蓓亚三美/i },
  { id: 'nachi', pattern: /\bNACHI\b|不二越/i, ambiguous: true },
  { id: 'cu', pattern: /\bC&U\b|人本轴承/i, ambiguous: true },
  { id: 'zwz', pattern: /\bZWZ\b|瓦轴/i },
];

const bearingContext = /\b(?:ball|roller|rolling(?:[- ]element)?|wheel|motor|spindle|journal|thrust|needle|spherical|tapered|ceramic|magnetic|foil|air|wind turbine|main shaft) bearings?\b|\bbearings?\b|轴承|滚子|滚动体/i;
const corporateSignal = /earnings|results|revenue|profit|loss|margin|shares?|stock|acqui(?:re|sition)|merger|divest|sell|sale|factory|plant|facility|production|launch|introduc|unveil|technology|innovation|partnership|joint venture|close|shutdown|restructur|appoint|data breach|财报|营收|利润|亏损|并购|收购|出售|工厂|产能|新品|技术|合作|关停|重组/i;
const rejectNews = /obituar|funeral|dental|handpiece|fishing reel|skateboard|bottom bracket|cycling weekly|catapult|wildlife|window vandal|artist turns ball bearings|彩票|色情|牙科/i;
const lowTrustPublishers = /openpr\.com|market research future|grand view research|claim depot|finance\.biggo\.com|bitget|ad-hoc-news\.de|scanx\.trade/i;

function brandIdsFor(title: string): string[] {
  const hasBearingContext = bearingContext.test(title);
  return brandRules
    .filter((rule) => rule.pattern.test(title) && (!rule.ambiguous || hasBearingContext))
    .map((rule) => rule.id);
}

function isRelevantNews(title: string): boolean {
  if (!title || rejectNews.test(title)) return false;
  const brands = brandIdsFor(title);
  if (bearingContext.test(title)) return true;
  return brands.length > 0 && corporateSignal.test(title);
}

function categoriesFor(title: string): ContentCategory[] {
  const value = title.toLocaleLowerCase();
  const categories = new Set<ContentCategory>();
  if (/earnings|results|revenue|profit|margin|financial|财报|营收|利润/.test(value)) categories.add('finance');
  if (/shares?|stock|listing|ipo|股价|上市/.test(value)) categories.add('listing');
  if (/loss|decline|downturn|亏损|下滑/.test(value)) categories.add('loss');
  if (/acqui(?:re|sition)|merger|buyout|收购|并购/.test(value)) categories.add('merger');
  if (/close|closure|shutdown|bankrupt|restructur|关停|倒闭|重组/.test(value)) categories.add('restructuring');
  if (/launch|introduc|unveil|new (?:line|product|series)|新品|发布|推出/.test(value)) categories.add('product');
  if (/technology|innovation|research|digital|monitoring|sensor|ceramic|electric|robot|技术|研发|创新|监测|陶瓷|电驱/.test(value)) categories.add('technology');
  if (/factory|plant|facility|production|capacity|工厂|产能|投产/.test(value)) categories.add('capacity');
  if (/supply|distribution|logistics|供应|物流|配送/.test(value)) categories.add('supply-chain');
  if (/market|demand|sales|outlook|市场|需求|销量/.test(value)) categories.add('market');
  if (categories.size === 0) categories.add('company');
  return [...categories];
}

function financeEventType(categories: ContentCategory[]): FinanceItem['eventType'] {
  if (categories.includes('merger')) return 'merger';
  if (categories.includes('restructuring')) return 'restructuring';
  if (categories.includes('loss')) return 'loss';
  if (categories.includes('listing')) return 'listing';
  return 'earnings';
}

function newsType(categories: ContentCategory[]): NewsItem['newsType'] {
  if (categories.includes('supply-chain')) return 'supply-chain';
  if (categories.includes('technology')) return 'technology';
  if (categories.includes('product')) return 'product';
  return categories.includes('market') ? 'industry' : 'company';
}

interface NewsFeedConfig {
  id: string;
  query: string;
  hl: string;
  gl: string;
  ceid: string;
}

const newsFeeds: NewsFeedConfig[] = [
  {
    id: 'google-brands',
    query: '(SKF OR Schaeffler OR Timken OR "NSK bearings" OR "NTN Bearing" OR JTEKT OR Koyo OR MinebeaMitsumi OR "NACHI bearings" OR "C&U Bearings" OR ZWZ) (bearings OR earnings OR acquisition OR launch OR factory OR technology) when:120d',
    hl: 'en-US', gl: 'US', ceid: 'US:en',
  },
  {
    id: 'google-industry',
    query: '("bearing manufacturer" OR "bearing maker" OR "bearing plant" OR "bearing factory" OR "bearing technology" OR "bearing industry") when:120d',
    hl: 'en-US', gl: 'US', ceid: 'US:en',
  },
  {
    id: 'google-technology',
    query: '("wheel bearing" OR "wind turbine bearing" OR "electric motor bearing" OR "ceramic bearing") (launch OR technology OR market OR factory OR acquisition) when:180d',
    hl: 'en-US', gl: 'US', ceid: 'US:en',
  },
  {
    id: 'google-chinese',
    query: '("SKF 轴承" OR "舍弗勒 轴承" OR "铁姆肯 轴承" OR "NSK 轴承" OR "NTN 轴承" OR "捷太格特 轴承" OR "人本轴承" OR "瓦轴") when:180d',
    hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans',
  },
];

interface ParsedNews {
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
  sourceUrl?: string;
  feedId: string;
  officialBrandId?: string;
}

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: true });

function parseGoogleNews(xml: string, feedId: string): ParsedNews[] {
  const document = xmlParser.parse(xml) as { rss?: { channel?: { item?: unknown | unknown[] } } };
  const raw = document.rss?.channel?.item;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return items.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const item = candidate as Record<string, unknown>;
    const source = item.source && typeof item.source === 'object' ? item.source as Record<string, unknown> : undefined;
    const sourceName = textOf(item.source) || 'Google News indexed publisher';
    const sourceUrl = source ? textOf(source['@_url']) : undefined;
    const rawTitle = stripHtml(textOf(item.title));
    const suffix = sourceName ? ` - ${sourceName}` : '';
    const title = suffix && rawTitle.endsWith(suffix) ? rawTitle.slice(0, -suffix.length).trim() : rawTitle;
    const url = textOf(item.link) || textOf(item.guid);
    const publishedAt = safeIsoDate(textOf(item.pubDate));
    if (!title || !url.startsWith('https://') || !publishedAt) return [];
    return [{ title, url, publishedAt, sourceName, sourceUrl, feedId }];
  });
}

function publisherSource(article: ParsedNews): SourceRecord {
  const officialBrand = article.officialBrandId
    ? fixtureBrands.find((brand) => brand.id === article.officialBrandId)
    : fixtureBrands.find((brand) => brand.shortName.toLocaleLowerCase() === article.sourceName.toLocaleLowerCase());
  const localizedOfficialNames: Record<string, string> = {
    'SKF official newsroom': 'SKF 官方新闻室',
    'The Timken Company': '铁姆肯公司',
  };
  return {
    id: hashId('publisher', `${article.sourceName}|${article.sourceUrl ?? ''}`),
    name: text(localizedOfficialNames[article.sourceName] ?? article.sourceName, article.sourceName),
    type: officialBrand ? 'official' : 'rss',
    tier: officialBrand ? 'official' : 'secondary',
    verified: Boolean(officialBrand),
    brandId: officialBrand?.id,
    homepage: article.sourceUrl,
    notes: text(
      '保存公开新闻索引的标题、来源、日期和链接；不复制新闻全文。',
      'Stores public news-index metadata and links; article full text is not copied.',
    ),
  };
}

function toFeedItem(article: ParsedNews): FeedItem {
  const source = publisherSource(article);
  const categories = categoriesFor(article.title);
  const brands = [...new Set([...(article.officialBrandId ? [article.officialBrandId] : []), ...brandIdsFor(article.title)])];
  const isFinance = categories.some((category) => ['finance', 'listing', 'loss', 'merger', 'restructuring'].includes(category));
  const base = {
    id: hashId('news', article.url),
    demo: false as const,
    title: text(article.title, article.title),
    originalTitle: article.title,
    summary: text(
      `这是真实新闻索引，来源为 ${source.name.zh}。本站只保存标题和元数据，请点击“查看原文”阅读完整报道。`,
      `This is a real news index entry from ${article.sourceName}. BearingScope stores metadata only; open the source to read the full report.`,
    ),
    keyFacts: [
      text(`发布来源：${source.name.zh}`, `Publisher: ${article.sourceName}`),
      text('未在本站复制新闻全文。', 'Article full text is not copied by BearingScope.'),
    ],
    brandIds: brands,
    region: 'Global',
    categories,
    source,
    originalLanguage: /[\u3400-\u9fff]/u.test(article.title) ? 'zh' : 'en',
    publishedAt: article.publishedAt,
    fetchedAt: generatedAt,
    url: article.url,
    canonicalUrl: article.url,
    confidence: source.tier === 'official' ? 0.94 : 0.78,
    relatedSourceUrls: [] as string[],
  };
  if (isFinance) {
    return { ...base, kind: 'finance', eventType: financeEventType(categories), metrics: {} } satisfies FinanceItem;
  }
  return { ...base, kind: 'news', newsType: newsType(categories) } satisfies NewsItem;
}

function parseSkfOfficial(html: string): ParsedNews[] {
  const items: ParsedNews[] = [];
  const pattern = /<a href="(https:\/\/news\.cision\.com\/skf\/r\/[^"]+)" class="bodytext content">[\s\S]*?<h2>([\s\S]*?)<\/h2>\s*<time pubdate="([^"]+)"/gi;
  for (const match of html.matchAll(pattern)) {
    const publishedAt = safeIsoDate(match[3]);
    const title = stripHtml(match[2]);
    if (!publishedAt || !title) continue;
    items.push({
      title,
      url: match[1],
      publishedAt,
      sourceName: 'SKF official newsroom',
      sourceUrl: 'https://news.cision.com/skf',
      feedId: 'official-skf',
      officialBrandId: 'skf',
    });
  }
  return items.slice(0, 24);
}

function parseTimkenOfficial(html: string): ParsedNews[] {
  const items: ParsedNews[] = [];
  const pattern = /<div class="item">[\s\S]*?<div class="wd_date">([\s\S]*?)<\/div>[\s\S]*?<div class="wd_title"><a href="(https:\/\/investors\.timken\.com\/[^"]+)">([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const publishedAt = safeIsoDate(stripHtml(match[1]));
    const title = stripHtml(match[3]);
    if (!publishedAt || !title) continue;
    items.push({
      title,
      url: match[2],
      publishedAt,
      sourceName: 'The Timken Company',
      sourceUrl: 'https://investors.timken.com/financial-news/press-releases/default.aspx',
      feedId: 'official-timken',
      officialBrandId: 'timken',
    });
  }
  return items.slice(0, 24);
}

async function collectOfficialNews(): Promise<{ items: ParsedNews[]; health: SnapshotSourceHealth[] }> {
  const configs = [
    { id: 'official-skf', url: 'https://news.cision.com/skf/Index/1000', parse: parseSkfOfficial },
    { id: 'official-timken', url: 'https://investors.timken.com/financial-news/press-releases/default.aspx', parse: parseTimkenOfficial },
  ];
  const items: ParsedNews[] = [];
  const health: SnapshotSourceHealth[] = [];
  for (const config of configs) {
    try {
      const parsed = config.parse(await fetchText(config.url));
      items.push(...parsed);
      health.push({ id: config.id, status: parsed.length ? 'ok' : 'degraded', itemCount: parsed.length, checkedAt: generatedAt, message: parsed.length ? undefined : 'Official page structure returned no entries.' });
    } catch (error) {
      health.push({ id: config.id, status: 'failed', itemCount: 0, checkedAt: generatedAt, message: error instanceof Error ? error.message : String(error) });
    }
  }
  return { items, health };
}

async function collectNews(): Promise<{ items: FeedItem[]; health: SnapshotSourceHealth[] }> {
  const articles: ParsedNews[] = [];
  const health: SnapshotSourceHealth[] = [];
  for (const feed of newsFeeds) {
    const url = new URL('https://news.google.com/rss/search');
    url.searchParams.set('q', feed.query);
    url.searchParams.set('hl', feed.hl);
    url.searchParams.set('gl', feed.gl);
    url.searchParams.set('ceid', feed.ceid);
    try {
      const parsed = parseGoogleNews(await fetchText(url.toString()), feed.id)
        .filter((item) => isRelevantNews(item.title) && !rejectNews.test(item.sourceName) && !lowTrustPublishers.test(item.sourceName));
      articles.push(...parsed);
      health.push({ id: feed.id, status: parsed.length ? 'ok' : 'degraded', itemCount: parsed.length, checkedAt: generatedAt, message: parsed.length ? undefined : 'Feed returned no strictly relevant items.' });
    } catch (error) {
      health.push({ id: feed.id, status: 'failed', itemCount: 0, checkedAt: generatedAt, message: error instanceof Error ? error.message : String(error) });
    }
    await wait(350);
  }

  const official = await collectOfficialNews();
  articles.push(...official.items);
  health.push(...official.health);

  const byTitle = new Map<string, ParsedNews>();
  for (const article of articles) {
    const key = article.title.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
    const existing = byTitle.get(key);
    if (!existing || article.officialBrandId || Date.parse(article.publishedAt) > Date.parse(existing.publishedAt)) byTitle.set(key, article);
  }
  return {
    items: [...byTitle.values()].map(toFeedItem).sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)).slice(0, 120),
    health,
  };
}

const researchPhrases = [
  'rolling bearing',
  'rolling element bearing',
  'roller bearing',
  'ball bearing',
  'bearing fault diagnosis',
  'bearing remaining useful life',
  'wind turbine main bearing',
  'electric motor bearing',
  'high speed bearing',
  'bearing lubrication',
  'bearing cage',
  'bearing raceway',
  'bearing current',
];

const mechanicalPaper = /\b(?:rolling(?:[- ]element)?|roller|ball|needle|tapered|spherical|thrust|journal|magnetic|foil|air|ceramic|wheel|motor|spindle|wind turbine|main shaft|inter-shaft) bearings?\b|\bbearings?\s+(?:fault|diagnos|prognos|lubric|life|remaining useful life|cage|raceway|vibration|condition|current|damage|defect|wear|friction|stiffness|dynamics|failure|health)|\b(?:fault|diagnos|prognos|remaining useful life|lubrication|vibration|condition monitoring)\b.*\bbearings?\b/i;

function paperRelevant(title: string): boolean {
  return mechanicalPaper.test(title) && !/load-bearing|child-bearing|bearing capacity of (?:soil|pile|foundation)|bone|implant|geological|ore-bearing|water-bearing|symbol-bearing/i.test(title);
}

function dateParts(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('date-parts' in value)) return undefined;
  const parts = (value as { 'date-parts'?: unknown })['date-parts'];
  const first = Array.isArray(parts) && Array.isArray(parts[0]) ? parts[0] as unknown[] : undefined;
  if (!first?.length) return undefined;
  const year = Number(first[0]);
  const month = Number(first[1] ?? 1);
  const day = Number(first[2] ?? 1);
  if (!Number.isInteger(year) || year < 1900) return undefined;
  return new Date(Date.UTC(year, Math.max(0, month - 1), Math.max(1, day))).toISOString();
}

interface CrossrefWork {
  DOI?: string;
  title?: string[];
  author?: Array<{ given?: string; family?: string }>;
  'container-title'?: string[];
  'published-online'?: unknown;
  'published-print'?: unknown;
  published?: unknown;
  URL?: string;
  'is-referenced-by-count'?: number;
  license?: Array<{ URL?: string }>;
}

function journalSource(journal: string, homepage?: string): SourceRecord {
  return {
    id: hashId('journal', journal || 'Crossref'),
    name: text(journal || 'Crossref indexed journal', journal || 'Crossref indexed journal'),
    type: 'journal',
    tier: 'academic',
    verified: true,
    homepage,
    notes: text('论文元数据由 Crossref/OpenAlex 索引，原文以 DOI 页面为准。', 'Paper metadata is indexed by Crossref/OpenAlex; follow the DOI for the publisher record.'),
  };
}

function researchSummary(title: string, journal: string): LocalizedText {
  return text(
    `真实论文元数据：该成果“${title}”发表于 ${journal || '学术出版物'}。本站不复制全文，请通过 DOI 或开放获取页面核验摘要与研究结论。`,
    `Real paper metadata: “${title}” was published by ${journal || 'an academic venue'}. BearingScope does not copy full text; use the DOI or OA page to verify the abstract and findings.`,
  );
}

function crossrefToResearch(work: CrossrefWork): ResearchItem | undefined {
  const titleValue = stripHtml(work.title?.[0] ?? '');
  const doi = work.DOI?.toLocaleLowerCase();
  if (!titleValue || !doi || !paperRelevant(titleValue)) return undefined;
  const publishedAt = dateParts(work['published-online']) ?? dateParts(work['published-print']) ?? dateParts(work.published);
  if (!publishedAt) return undefined;
  const journal = stripHtml(work['container-title']?.[0] ?? '') || 'Crossref indexed journal';
  const paperUrl = `https://doi.org/${doi}`;
  const openAccess = work.license?.some((license) => /creativecommons\.org/i.test(license.URL ?? '')) ? true : null;
  const authors = (work.author ?? []).map((author) => normalizeSpace(`${author.given ?? ''} ${author.family ?? ''}`)).filter(Boolean).slice(0, 12);
  return {
    id: hashId('paper', doi), kind: 'research', demo: false,
    title: text(titleValue, titleValue), originalTitle: titleValue, summary: researchSummary(titleValue, journal),
    keyFacts: [text(`DOI：${doi}`, `DOI: ${doi}`), text(`期刊：${journal}`, `Journal: ${journal}`)],
    brandIds: brandIdsFor(titleValue), region: 'Global', categories: ['technology'],
    source: journalSource(journal, paperUrl), originalLanguage: 'und', publishedAt, fetchedAt: generatedAt,
    url: paperUrl, canonicalUrl: paperUrl, confidence: 0.9, relatedSourceUrls: [], authors, journal, doi,
    citations: Number(work['is-referenced-by-count'] ?? 0), openAccess, paperUrl,
  };
}

interface OpenAlexWork {
  id?: string;
  doi?: string;
  display_name?: string;
  publication_date?: string;
  language?: string;
  cited_by_count?: number;
  authorships?: Array<{ author?: { display_name?: string } }>;
  primary_location?: { landing_page_url?: string; source?: { display_name?: string } };
  best_oa_location?: { landing_page_url?: string };
  open_access?: { is_oa?: boolean };
}

function openAlexToResearch(work: OpenAlexWork): ResearchItem | undefined {
  const titleValue = stripHtml(work.display_name ?? '');
  const doi = work.doi?.replace(/^https?:\/\/doi\.org\//i, '').toLocaleLowerCase();
  if (!titleValue || !doi || !paperRelevant(titleValue) || !work.publication_date) return undefined;
  const publishedAt = safeIsoDate(work.publication_date);
  if (!publishedAt) return undefined;
  const journal = stripHtml(work.primary_location?.source?.display_name ?? '') || 'OpenAlex indexed journal';
  const doiUrl = `https://doi.org/${doi}`;
  const paperUrl = work.best_oa_location?.landing_page_url ?? doiUrl;
  const authors = (work.authorships ?? []).map((entry) => entry.author?.display_name?.trim() ?? '').filter(Boolean).slice(0, 12);
  return {
    id: hashId('paper', doi), kind: 'research', demo: false,
    title: text(titleValue, titleValue), originalTitle: titleValue, summary: researchSummary(titleValue, journal),
    keyFacts: [text(`DOI：${doi}`, `DOI: ${doi}`), text(`期刊：${journal}`, `Journal: ${journal}`)],
    brandIds: brandIdsFor(titleValue), region: 'Global', categories: ['technology'],
    source: journalSource(journal, doiUrl), originalLanguage: work.language ?? 'und', publishedAt, fetchedAt: generatedAt,
    url: doiUrl, canonicalUrl: doiUrl, confidence: 0.92, relatedSourceUrls: [], authors, journal, doi,
    citations: Number(work.cited_by_count ?? 0), openAccess: work.open_access?.is_oa ?? null, paperUrl,
  };
}

async function collectCrossref(): Promise<{ items: ResearchItem[]; health: SnapshotSourceHealth }> {
  const items: ResearchItem[] = [];
  let successfulQueries = 0;
  const failures: string[] = [];
  for (const phrase of researchPhrases) {
    const url = new URL('https://api.crossref.org/works');
    url.searchParams.set('query.title', `"${phrase}"`);
    url.searchParams.set('filter', `from-pub-date:${fromDate},until-pub-date:${today},type:journal-article`);
    url.searchParams.set('rows', '40');
    url.searchParams.set('select', 'DOI,title,author,container-title,published-online,published-print,published,URL,is-referenced-by-count,license');
    try {
      const payload = JSON.parse(await fetchText(url.toString())) as { message?: { items?: CrossrefWork[] } };
      items.push(...(payload.message?.items ?? []).flatMap((work) => crossrefToResearch(work) ?? []));
      successfulQueries += 1;
    } catch (error) {
      failures.push(`${phrase}: ${error instanceof Error ? error.message : String(error)}`);
    }
    await wait(260);
  }
  return {
    items,
    health: {
      id: 'crossref', status: successfulQueries === researchPhrases.length ? 'ok' : successfulQueries ? 'degraded' : 'failed',
      itemCount: items.length, checkedAt: generatedAt, message: failures.length ? failures.join(' | ') : undefined,
    },
  };
}

async function collectOpenAlex(): Promise<{ items: ResearchItem[]; health: SnapshotSourceHealth }> {
  const items: ResearchItem[] = [];
  let successfulQueries = 0;
  const failures: string[] = [];
  for (const phrase of researchPhrases.slice(0, 8)) {
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.set('search', `"${phrase}"`);
    url.searchParams.set('filter', `from_publication_date:${fromDate},to_publication_date:${today},type:article,is_retracted:false`);
    url.searchParams.set('per_page', '30');
    url.searchParams.set('select', 'id,doi,display_name,publication_date,language,cited_by_count,is_retracted,authorships,primary_location,best_oa_location,open_access');
    if (process.env.OPENALEX_API_KEY) url.searchParams.set('api_key', process.env.OPENALEX_API_KEY);
    try {
      const payload = JSON.parse(await fetchText(url.toString())) as { results?: OpenAlexWork[] };
      items.push(...(payload.results ?? []).flatMap((work) => openAlexToResearch(work) ?? []));
      successfulQueries += 1;
    } catch (error) {
      failures.push(`${phrase}: ${error instanceof Error ? error.message : String(error)}`);
    }
    await wait(260);
  }
  return {
    items,
    health: {
      id: 'openalex', status: successfulQueries === 8 ? 'ok' : successfulQueries ? 'degraded' : 'failed',
      itemCount: items.length, checkedAt: generatedAt,
      message: failures.length ? `${process.env.OPENALEX_API_KEY ? '' : 'No API key; best-effort mode. '}${failures.join(' | ')}` : process.env.OPENALEX_API_KEY ? undefined : 'No API key; best-effort enrichment.',
    },
  };
}

function mergeResearch(crossref: ResearchItem[], openAlex: ResearchItem[]): ResearchItem[] {
  const byDoi = new Map<string, ResearchItem>();
  for (const item of [...crossref, ...openAlex]) {
    const key = item.doi ?? item.originalTitle.toLocaleLowerCase();
    const existing = byDoi.get(key);
    if (!existing) {
      byDoi.set(key, item);
      continue;
    }
    const preferred = existing.source.name.en === 'Crossref indexed journal' && item.source.name.en !== 'OpenAlex indexed journal' ? item : existing;
    byDoi.set(key, {
      ...preferred,
      authors: preferred.authors.length ? preferred.authors : item.authors,
      journal: preferred.journal.includes('indexed journal') ? item.journal : preferred.journal,
      citations: Math.max(existing.citations, item.citations),
      openAccess: existing.openAccess ?? item.openAccess,
      paperUrl: item.openAccess ? item.paperUrl : preferred.paperUrl,
      originalLanguage: existing.originalLanguage === 'und' ? item.originalLanguage : existing.originalLanguage,
    });
  }
  return [...byDoi.values()]
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt) || right.citations - left.citations)
    .slice(0, 120);
}

function marketFromResearch(research: ResearchItem[]): MarketItem[] {
  const themes = [
    /wind turbine|main bearing/i,
    /electric motor|high.speed/i,
    /ceramic|hybrid bearing/i,
    /condition monitoring|fault diagnos/i,
    /remaining useful life|prognos/i,
    /lubric/i,
    /bearing current/i,
    /cage|raceway/i,
  ];
  const selected: ResearchItem[] = [];
  for (const theme of themes) {
    const match = research.find((paper) => theme.test(paper.originalTitle) && !selected.some((selectedPaper) => selectedPaper.id === paper.id));
    if (match) selected.push(match);
  }
  for (const paper of research) {
    if (selected.length >= 8) break;
    if (!selected.some((selectedPaper) => selectedPaper.id === paper.id)) selected.push(paper);
  }
  return selected.slice(0, 8).map((paper, index) => ({
    id: `market-${paper.id}`, kind: 'market', demo: false,
    title: paper.title, originalTitle: paper.originalTitle,
    summary: text(
      `真实研究信号：该方向近期出现在 ${paper.journal} 的论文元数据中。点击原文查看 DOI 记录；本站不据此虚构市场规模或销量预测。`,
      `Real research signal: this topic appears in recent metadata from ${paper.journal}. Open the DOI record for evidence; BearingScope does not invent market-size or sales forecasts.`,
    ),
    keyFacts: paper.keyFacts, brandIds: paper.brandIds, region: paper.region, categories: ['technology', 'market'],
    source: paper.source, originalLanguage: paper.originalLanguage, publishedAt: paper.publishedAt, fetchedAt: generatedAt,
    url: paper.paperUrl ?? paper.url, canonicalUrl: paper.canonicalUrl, confidence: paper.confidence,
    relatedSourceUrls: paper.relatedSourceUrls, horizon: index < 3 ? 'near' : index < 6 ? 'mid' : 'long',
    maturity: index < 2 ? 'scaling' : 'emerging',
  }));
}

function snapshotBrands(): Brand[] {
  return fixtureBrands.map((brand) => ({
    ...brand,
    wechatDisplayNames: [`${brand.shortName} 品牌公众号来源（显示名待人工核验）`],
  }));
}

function uniqueSources(feed: FeedItem[], research: ResearchItem[], brands: Brand[]): SourceRecord[] {
  const records = new Map<string, SourceRecord>();
  for (const item of [...feed, ...research]) records.set(item.source.id, item.source);
  records.set('crossref-api', {
    id: 'crossref-api', name: text('Crossref 学术元数据', 'Crossref scholarly metadata'), type: 'journal', tier: 'academic', verified: true,
    homepage: 'https://api.crossref.org/', notes: text('无密钥主学术元数据源。', 'Primary no-key scholarly metadata source.'),
  });
  records.set('openalex-api', {
    id: 'openalex-api', name: text('OpenAlex 学术索引', 'OpenAlex scholarly index'), type: 'journal', tier: 'academic', verified: true,
    homepage: 'https://openalex.org/', notes: text('用于尽力补充开放获取与引用信息；正式稳定使用建议配置免费 API Key。', 'Best-effort OA and citation enrichment; a free API key is recommended for stable production use.'),
  });
  for (const brand of brands) {
    records.set(`wechat-${brand.id}`, {
      id: `wechat-${brand.id}`,
      name: text(`${brand.shortName} 品牌微信公众号（待授权接入）`, `${brand.shortName} brand WeChat source (authorization pending)`),
      type: 'wechat', tier: 'official', verified: false, brandId: brand.id, homepage: 'https://mp.weixin.qq.com/',
      notes: text('不使用登录态、验证码或隐藏接口抓取；公开文章通过获授权接口、合规服务商或人工 URL 接入。', 'No scraping of login state, CAPTCHAs or private endpoints; public articles require an authorized API, licensed provider or manual URL.'),
    });
  }
  return [...records.values()];
}

function validateSnapshot(snapshot: LiveContentSnapshot): void {
  if (snapshot.feedItems.length < 15) throw new Error(`Refusing deployment: only ${snapshot.feedItems.length} real news items were collected (minimum 15).`);
  if (snapshot.researchItems.length < 12) throw new Error(`Refusing deployment: only ${snapshot.researchItems.length} real papers were collected (minimum 12).`);
  const allItems = [...snapshot.feedItems, ...snapshot.marketItems, ...snapshot.researchItems];
  const demos = allItems.filter((item) => item.demo);
  if (demos.length) throw new Error(`Refusing deployment: live snapshot contains ${demos.length} demo items.`);
  const missingLinks = allItems.filter((item) => !(item.url ?? item.canonicalUrl)?.startsWith('https://'));
  if (missingLinks.length) throw new Error(`Refusing deployment: ${missingLinks.length} live items have no HTTPS source link.`);
  const untranslatedTitles = allItems.filter((item) => !isValidChineseTranslation(item.originalTitle, item.title.zh));
  if (untranslatedTitles.length) {
    throw new Error(`Refusing deployment: ${untranslatedTitles.length} live items do not have a valid Chinese title.`);
  }
}

async function loadTranslationCache(): Promise<Map<string, string>> {
  const snapshots: unknown[] = [];
  try {
    snapshots.push(JSON.parse(await readFile(outputPath, 'utf8')) as unknown);
  } catch {
    // The first synchronization may not have a local snapshot yet.
  }
  try {
    snapshots.push(JSON.parse(await fetchText(deployedSnapshotUrl, 1)) as unknown);
  } catch {
    // The repository snapshot remains a valid cache when the deployed site is unavailable.
  }
  return extractTranslationCache(...snapshots);
}

function applyFeedTranslations(items: FeedItem[], translations: Map<string, string>): FeedItem[] {
  return items.flatMap((item) => {
    const translated = translations.get(normalizeTitleKey(item.originalTitle));
    if (!translated || !isValidChineseTranslation(item.originalTitle, translated)) return [];
    return [{ ...item, title: { zh: translated, en: item.originalTitle } }];
  });
}

function applyResearchTranslations(items: ResearchItem[], translations: Map<string, string>): ResearchItem[] {
  return items.flatMap((item) => {
    const translated = translations.get(normalizeTitleKey(item.originalTitle));
    if (!translated || !isValidChineseTranslation(item.originalTitle, translated)) return [];
    return [{
      ...item,
      title: { zh: translated, en: item.originalTitle },
      summary: { zh: researchSummary(translated, item.journal).zh, en: item.summary.en },
    }];
  });
}

async function main() {
  const translationCachePromise = loadTranslationCache();
  const news = await collectNews();
  const [crossref, openAlex] = await Promise.all([collectCrossref(), collectOpenAlex()]);
  const rawResearchItems = mergeResearch(crossref.items, openAlex.items);
  const translation = await translateMissingTitles(
    [...news.items, ...rawResearchItems].map((item) => item.originalTitle),
    await translationCachePromise,
  );
  const feedItems = applyFeedTranslations(news.items, translation.translations);
  const researchItems = applyResearchTranslations(rawResearchItems, translation.translations);
  const brands = snapshotBrands();
  const marketItems = marketFromResearch(researchItems);
  const sourceHealth: SnapshotSourceHealth[] = [
    ...news.health,
    crossref.health,
    openAlex.health,
    {
      id: 'title-translation',
      status: translation.unresolved.length ? (feedItems.length >= 15 && researchItems.length >= 12 ? 'degraded' : 'failed') : 'ok',
      itemCount: feedItems.length + researchItems.length,
      checkedAt: generatedAt,
      message: translation.unresolved.length
        ? `${translation.unresolved.length} titles were withheld because no valid Chinese translation was produced.`
        : `Chinese titles complete; ${translation.cacheHitCount} cache hits and ${translation.requestedCount} new translations.`,
    },
    {
      id: 'wechat-authorized-ingestion', status: 'degraded', itemCount: 0, checkedAt: generatedAt,
      message: 'Authorized API, licensed provider or manually supplied public article URLs are required.',
    },
  ];
  const snapshot: LiveContentSnapshot = {
    schemaVersion: 1,
    mode: 'live',
    generatedAt,
    feedItems,
    marketItems,
    researchItems,
    brands,
    sources: uniqueSources(feedItems, researchItems, brands),
    sourceHealth,
  };
  validateSnapshot(snapshot);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`BearingScope live snapshot written to ${outputPath}`);
  console.log(`Real news: ${snapshot.feedItems.length}; research: ${snapshot.researchItems.length}; market signals: ${snapshot.marketItems.length}`);
  for (const source of sourceHealth) console.log(`${source.id}: ${source.status} (${source.itemCount})${source.message ? ` - ${source.message}` : ''}`);
}

await main();
