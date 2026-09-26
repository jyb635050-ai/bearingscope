import { ArrowDownRight, ArrowUpRight, Flame } from 'lucide-react';
import type { BrandAttention, BrandWithActivity, TrendingTopic } from '../../shared/types';
import { formatRelativeTime, localize, type Language } from '../../lib/i18n';

interface TrendingPanelProps {
  topics: TrendingTopic[];
  language: Language;
  onSelectTopic?: (itemId: string) => void;
}

export function TrendingPanel({ topics, language, onSelectTopic }: TrendingPanelProps) {
  return (
    <section className="trending-panel" aria-labelledby="trending-title">
      <header className="panel-header">
        <h2 id="trending-title"><Flame aria-hidden="true" />{language === 'zh' ? '每日行业热点' : 'Daily industry signals'}</h2>
        <p>{language === 'zh' ? '近七日 · 综合时效、来源与行业事件排序' : 'Past 7 days · ranked by freshness, source and industry impact'}</p>
      </header>
      <ol className="trending-list">
        {topics.map((topic) => {
          const title = localize(topic.title, language);
          const content = (
            <>
              <strong>{title}</strong>
              <span>{language === 'zh' ? `${topic.sourceCount} 个来源` : `${topic.sourceCount} source${topic.sourceCount === 1 ? '' : 's'}`} · {formatRelativeTime(topic.lastUpdatedAt, language)}</span>
            </>
          );

          return (
            <li key={topic.itemId}>
              <span className="trending-list__rank">{topic.rank}</span>
              {topic.url ? (
                <a
                  className="trending-list__action"
                  href={topic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={language === 'zh' ? `打开原文：${title}（新窗口）` : `Open original: ${title} (new tab)`}
                >
                  {content}
                </a>
              ) : (
                <button
                  className="trending-list__action"
                  type="button"
                  onClick={() => onSelectTopic?.(topic.itemId)}
                  disabled={!onSelectTopic}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

interface BrandAttentionPanelProps {
  attention: BrandAttention[];
  brands: BrandWithActivity[];
  language: Language;
}

export function BrandAttentionPanel({ attention, brands, language }: BrandAttentionPanelProps) {
  const brandMap = new Map(brands.map(({ brand }) => [brand.id, brand]));
  return (
    <section className="brand-attention-panel" aria-labelledby="attention-title">
      <header className="panel-header">
        <h2 id="attention-title">{language === 'zh' ? '品牌七日关注度' : '7-day brand attention'}</h2>
        <p>{language === 'zh' ? '编辑关注名单，非市场排名' : 'Editorial watch list, not a market ranking'}</p>
      </header>
      <ol className="brand-attention-list">
        {attention.map((item, index) => {
          const brand = brandMap.get(item.brandId);
          const rising = item.change7d >= 0;
          const patterns = [
            '2,19 10,16 18,17 26,9 34,13 42,8 50,11 58,4 66,7 74,3',
            '2,14 10,17 18,12 26,15 34,8 42,10 50,5 58,9 66,4 74,6',
            '2,18 10,13 18,15 26,11 34,12 42,6 50,9 58,5 66,7 74,2',
            '2,9 10,11 18,8 26,14 34,12 42,16 50,13 58,18 66,15 74,19',
          ];
          return (
            <li key={item.brandId}>
              <div>
                <strong>{brand?.shortName ?? item.brandId.toUpperCase()}</strong>
                <span className={rising ? 'trend-positive' : 'trend-negative'}>
                  {rising ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
                  {Math.abs(item.change7d)}%
                </span>
              </div>
              <span className={`brand-sparkline${rising ? '' : ' brand-sparkline--down'}`} aria-hidden="true">
                <svg viewBox="0 0 76 22" preserveAspectRatio="none">
                  <polyline points={patterns[index % patterns.length]} />
                </svg>
              </span>
              <span>{item.mentions}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
