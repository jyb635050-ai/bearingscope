import type { ContentCategory, ContentKind, SourceType } from '../../shared/types';
import type { Language } from '../../lib/i18n';

const kindLabels: Record<ContentKind, Record<Language, string>> = {
  news: { zh: '行业动态', en: 'News' },
  finance: { zh: '财务资本', en: 'Finance' },
  market: { zh: '市场信号', en: 'Market signal' },
  research: { zh: '论文研究', en: 'Research' },
};

export const categoryLabels: Record<ContentCategory, Record<Language, string>> = {
  company: { zh: '公司', en: 'Company' },
  finance: { zh: '财务', en: 'Finance' },
  listing: { zh: '上市/股市', en: 'Listing / stocks' },
  product: { zh: '新产品', en: 'Products' },
  technology: { zh: '新技术', en: 'Technology' },
  market: { zh: '市场', en: 'Market' },
  capacity: { zh: '产能', en: 'Capacity' },
  loss: { zh: '亏损', en: 'Losses' },
  merger: { zh: '并购', en: 'M&A' },
  restructuring: { zh: '倒闭/重组', en: 'Closure / restructuring' },
  'supply-chain': { zh: '供应链', en: 'Supply chain' },
};

export const sourceTypeLabels: Record<SourceType, Record<Language, string>> = {
  official: { zh: '官方', en: 'Official' },
  rss: { zh: 'RSS', en: 'RSS' },
  wechat: { zh: '微信公众号', en: 'WeChat official account' },
  journal: { zh: '学术期刊', en: 'Journal' },
  regulator: { zh: '监管披露', en: 'Regulatory' },
  wire: { zh: '通讯社', en: 'Newswire' },
  demo: { zh: '演示来源', en: 'Demo source' },
};

export function kindLabel(kind: ContentKind, language: Language): string {
  return kindLabels[kind][language];
}

export function categoryLabel(category: ContentCategory, language: Language): string {
  return categoryLabels[category][language];
}

export function sourceTypeLabel(type: SourceType, language: Language): string {
  return sourceTypeLabels[type][language];
}
