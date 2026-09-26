import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TrendingPanel } from '../src/components/content/TrendingPanel';
import type { TrendingTopic } from '../src/shared/types';

const topic: TrendingTopic = {
  rank: 1,
  itemId: 'bearing-news-1',
  title: { zh: '舍弗勒轮毂轴承新产线在太仓投产', en: 'Schaeffler starts a new wheel-bearing line in Taicang' },
  url: 'https://publisher.example.com/original-bearing-news',
  mentions: 1,
  sourceCount: 1,
  lastUpdatedAt: new Date().toISOString(),
};

describe('TrendingPanel original article navigation', () => {
  it('renders a hotspot as a direct, safe original-article link', () => {
    render(<TrendingPanel topics={[topic]} language="zh" />);

    const link = screen.getByRole('link', { name: /打开原文：舍弗勒轮毂轴承新产线在太仓投产/ });
    expect(link).toHaveAttribute('href', topic.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('falls back to the in-site detail action only when no original URL exists', async () => {
    const onSelectTopic = vi.fn();
    render(<TrendingPanel topics={[{ ...topic, url: undefined }]} language="zh" onSelectTopic={onSelectTopic} />);

    await userEvent.click(screen.getByRole('button', { name: /舍弗勒轮毂轴承新产线在太仓投产/ }));
    expect(onSelectTopic).toHaveBeenCalledWith(topic.itemId);
  });
});
