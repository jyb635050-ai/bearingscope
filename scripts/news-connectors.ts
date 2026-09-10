export interface ConnectorArticle {
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
  sourceUrl?: string;
  feedId: string;
  officialBrandId?: string;
  official?: boolean;
  summary?: string;
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

function safeIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const raw = String(value).trim();
  const gdeltMatch = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  const microsoftJsonDate = raw.match(/^\/Date\((\d+)(?:[+-]\d+)?\)\/$/);
  const timestamp = microsoftJsonDate
    ? Number(microsoftJsonDate[1])
    : Date.parse(gdeltMatch
      ? `${gdeltMatch[1]}-${gdeltMatch[2]}-${gdeltMatch[3]}T${gdeltMatch[4]}:${gdeltMatch[5]}:${gdeltMatch[6]}Z`
      : raw);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

interface CuOfficialRecord {
  Id?: unknown;
  CreateTime?: unknown;
  Title?: unknown;
  Blurb?: unknown;
}

const cuEditorialSignal = /轴承|人本|制造|品牌|研发|专利|科技|技术|创新|机器人|轨道|汽车|工厂|产业|企业|项目|产能|市场|出口|订单|签约|合作|参展|榜单|百强|荣誉|获评|荣获|调研/i;

export function parseCuOfficialPayload(payload: unknown): ConnectorArticle[] {
  if (!payload || typeof payload !== 'object') return [];
  const records = (payload as { data?: unknown }).data;
  if (!Array.isArray(records)) return [];
  return records.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const record = candidate as CuOfficialRecord;
    const id = typeof record.Id === 'string' ? record.Id.trim() : '';
    const title = stripHtml(typeof record.Title === 'string' ? record.Title : '');
    const summary = stripHtml(typeof record.Blurb === 'string' ? record.Blurb : '');
    const publishedAt = safeIsoDate(record.CreateTime);
    if (!id || !title || !publishedAt || !cuEditorialSignal.test(`${title} ${summary}`)) return [];
    return [{
      title,
      summary: summary || undefined,
      url: `https://www.cugroup.com/Common/Carrierinfo?type=0&id=${encodeURIComponent(id)}`,
      publishedAt,
      sourceName: 'C&U Group official newsroom',
      sourceUrl: 'https://www.cugroup.com/About?id=4caf3ab3-3187-4862-b808-c8d7e9ec5a2b',
      feedId: 'official-cu',
      officialBrandId: 'cu',
      official: true,
    }];
  });
}

interface GdeltArticle {
  url?: unknown;
  title?: unknown;
  seendate?: unknown;
  domain?: unknown;
}

export function parseGdeltPayload(payload: unknown, feedId: string): ConnectorArticle[] {
  if (!payload || typeof payload !== 'object') return [];
  const articles = (payload as { articles?: unknown }).articles;
  if (!Array.isArray(articles)) return [];
  return articles.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const article = candidate as GdeltArticle;
    const title = stripHtml(typeof article.title === 'string' ? article.title : '');
    const url = typeof article.url === 'string' ? article.url.trim() : '';
    const domain = typeof article.domain === 'string' ? article.domain.trim().toLocaleLowerCase() : '';
    const publishedAt = safeIsoDate(article.seendate);
    if (!title || !url.startsWith('https://') || !publishedAt) return [];
    return [{
      title,
      url,
      publishedAt,
      sourceName: domain || new URL(url).hostname,
      sourceUrl: domain ? `https://${domain}` : new URL(url).origin,
      feedId,
    }];
  });
}

interface NewsApiArticle {
  title?: unknown;
  url?: unknown;
  publishedAt?: unknown;
  source?: { name?: unknown };
}

export function parseNewsApiPayload(payload: unknown, feedId: string): ConnectorArticle[] {
  if (!payload || typeof payload !== 'object') return [];
  const articles = (payload as { articles?: unknown }).articles;
  if (!Array.isArray(articles)) return [];
  return articles.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const article = candidate as NewsApiArticle;
    const title = stripHtml(typeof article.title === 'string' ? article.title : '');
    const url = typeof article.url === 'string' ? article.url.trim() : '';
    const publishedAt = safeIsoDate(article.publishedAt);
    if (!title || title === '[Removed]' || !url.startsWith('https://') || !publishedAt) return [];
    const sourceName = typeof article.source?.name === 'string' && article.source.name.trim()
      ? article.source.name.trim()
      : new URL(url).hostname;
    return [{
      title,
      url,
      publishedAt,
      sourceName,
      sourceUrl: new URL(url).origin,
      feedId,
    }];
  });
}
