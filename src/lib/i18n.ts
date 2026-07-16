import type { LocalizedText } from '../shared/types';

export type Language = 'zh' | 'en';

export function localize(value: LocalizedText | string | undefined, language: Language): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (language === 'zh') return value.zh?.trim() || '暂无中文内容';
  return value.en?.trim() || value.zh?.trim() || '';
}

export function formatDate(value: string, language: Language, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const hasStylePreset = options && ('dateStyle' in options || 'timeStyle' in options);

  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    ...(hasStylePreset ? {} : { year: 'numeric', month: 'short', day: 'numeric' } as const),
    ...options,
  }).format(date);
}

export function formatRelativeTime(value: string, language: Language, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { numeric: 'auto' });

  if (abs < 60) return rtf.format(seconds, 'second');
  if (abs < 3_600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3_600), 'hour');
  if (abs < 604_800) return rtf.format(Math.round(seconds / 86_400), 'day');
  return formatDate(value, language);
}

export const copy = {
  zh: {
    demo: '演示数据',
    loading: '正在汇集全球轴承情报…',
    retry: '重新加载',
    errorTitle: '数据暂时无法载入',
    emptyTitle: '暂无匹配信息',
    emptyBody: '请调整筛选条件或稍后再试。',
    save: '收藏',
    saved: '已收藏',
    details: '查看详情',
    original: '查看原文',
    source: '来源',
    published: '发布于',
    fetched: '采集于',
    confidence: '可信度',
    keyFacts: '关键事实',
    relatedSources: '关联信源',
    close: '关闭',
  },
  en: {
    demo: 'Demo data',
    loading: 'Gathering global bearing intelligence…',
    retry: 'Try again',
    errorTitle: 'Data is temporarily unavailable',
    emptyTitle: 'No matching intelligence',
    emptyBody: 'Adjust the filters or check back later.',
    save: 'Save',
    saved: 'Saved',
    details: 'View details',
    original: 'Open source',
    source: 'Source',
    published: 'Published',
    fetched: 'Collected',
    confidence: 'Confidence',
    keyFacts: 'Key facts',
    relatedSources: 'Related sources',
    close: 'Close',
  },
} as const;

export function ui(language: Language) {
  return copy[language];
}
