import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContentDetailDrawer } from '../src/components/content/ContentDetailDrawer';
import type { NewsItem } from '../src/shared/types';

const item: NewsItem = {
  id: 'localized-news',
  kind: 'news',
  newsType: 'technology',
  demo: false,
  title: { zh: 'SKF 推出新一代陶瓷混合轴承', en: 'SKF launches a next-generation ceramic hybrid bearing' },
  originalTitle: 'SKF launches a next-generation ceramic hybrid bearing',
  summary: { zh: '这是经过中文化的真实新闻元数据。', en: 'This is real localized news metadata.' },
  keyFacts: [{ zh: '来源可追溯', en: 'Traceable source' }],
  brandIds: ['skf'],
  region: 'Global',
  categories: ['technology'],
  source: {
    id: 'skf-official',
    name: { zh: 'SKF 官方新闻室', en: 'SKF official newsroom' },
    type: 'official',
    tier: 'official',
    verified: true,
  },
  originalLanguage: 'en',
  publishedAt: '2026-07-16T00:00:00.000Z',
  fetchedAt: '2026-07-16T01:00:00.000Z',
  url: 'https://example.com/bearing-news',
  canonicalUrl: 'https://example.com/bearing-news',
  confidence: 0.94,
  relatedSourceUrls: [],
};

describe('Chinese content rendering', () => {
  it('shows the Chinese title and does not expose the English original in Chinese mode', () => {
    render(<ContentDetailDrawer item={item} language="zh" onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: item.title.zh })).toBeInTheDocument();
    expect(screen.queryByText(item.originalTitle)).not.toBeInTheDocument();
    expect(screen.getByText(item.source.name.zh)).toBeInTheDocument();
  });

  it('shows the original English title in English mode', () => {
    render(<ContentDetailDrawer item={item} language="en" onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: item.originalTitle })).toBeInTheDocument();
  });
});
