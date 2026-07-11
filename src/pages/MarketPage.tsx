import { useState } from 'react';
import { Activity, ArrowRight, Gauge, Orbit, Timer } from 'lucide-react';
import type { ContentItem, MarketItem } from '../shared/types';
import { useBookmarks } from '../lib/bookmarks';
import { localize } from '../lib/i18n';
import { useMarket } from '../lib/queries';
import { ContentDetailDrawer, DemoNotice, EmptyState, ErrorState, LoadingState, PageHeader } from '../components/content';
import type { PageLanguageProps } from './HomePage';

type Horizon = 'all' | MarketItem['horizon'];

const horizonLabels: Record<Horizon, { zh: string; en: string }> = {
  all: { zh: '全部方向', en: 'All horizons' },
  near: { zh: '近期', en: 'Near term' },
  mid: { zh: '中期', en: 'Mid term' },
  long: { zh: '长期', en: 'Long term' },
};

const maturityLabels: Record<MarketItem['maturity'], { zh: string; en: string }> = {
  emerging: { zh: '前沿探索', en: 'Emerging' },
  scaling: { zh: '规模化中', en: 'Scaling' },
  established: { zh: '产业成熟', en: 'Established' },
};

export function MarketPage({ language }: PageLanguageProps) {
  const market = useMarket();
  const bookmarks = useBookmarks();
  const [horizon, setHorizon] = useState<Horizon>('all');
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const items = (market.data?.items ?? []).filter((item) => horizon === 'all' || item.horizon === horizon);

  return (
    <main className="page page--market">
      <PageHeader
        language={language}
        title={{ zh: '市场未来', en: 'Future signals' }}
        description={{ zh: '从应用、材料、制造与监测技术中识别轴承产业的下一条增长曲线。', en: 'Identify the bearing industry’s next growth curves across applications, materials, manufacturing and monitoring.' }}
        meta={<span><Orbit aria-hidden="true" />{language === 'zh' ? '趋势证据 · 技术成熟度 · 时间跨度' : 'Trend evidence · maturity · horizon'}</span>}
      />
      <DemoNotice language={language}>{language === 'zh' ? '趋势卡不包含无来源的市场规模预测数字，成熟度仅用于演示分类。' : 'Trend cards avoid unsourced market forecasts; maturity labels are demonstrative.'}</DemoNotice>

      <nav className="segment-control market-horizon" aria-label={language === 'zh' ? '趋势时间跨度' : 'Trend horizon'}>
        {(Object.keys(horizonLabels) as Horizon[]).map((value) => (
          <button key={value} type="button" className={horizon === value ? 'is-active' : ''} onClick={() => setHorizon(value)} aria-pressed={horizon === value}>{horizonLabels[value][language]}</button>
        ))}
      </nav>

      {market.isLoading ? <LoadingState language={language} /> : market.isError ? <ErrorState language={language} onRetry={() => market.refetch()} /> : items.length === 0 ? <EmptyState language={language} /> : (
        <section className="market-signal-grid" aria-label={language === 'zh' ? '产业趋势信号' : 'Industry trend signals'}>
          {items.map((item, index) => (
            <article key={item.id} className={`market-signal market-signal--${item.horizon}`}>
              <header>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className={`maturity maturity--${item.maturity}`}><Activity aria-hidden="true" />{maturityLabels[item.maturity][language]}</span>
                <button type="button" onClick={() => bookmarks.toggle(item.id)} aria-pressed={bookmarks.bookmarked.has(item.id)}>{bookmarks.bookmarked.has(item.id) ? (language === 'zh' ? '已收藏' : 'Saved') : (language === 'zh' ? '收藏' : 'Save')}</button>
              </header>
              <div className="market-signal__body">
                <h2><button type="button" onClick={() => setSelected(item)}>{localize(item.title, language)}</button></h2>
                <p>{localize(item.summary, language)}</p>
              </div>
              <footer>
                <span><Timer aria-hidden="true" />{horizonLabels[item.horizon][language]}</span>
                <span><Gauge aria-hidden="true" />{Math.round(item.confidence * 100)}%</span>
                <button type="button" onClick={() => setSelected(item)} aria-label={language === 'zh' ? '查看趋势详情' : 'View signal details'}><ArrowRight aria-hidden="true" /></button>
              </footer>
            </article>
          ))}
        </section>
      )}

      <ContentDetailDrawer item={selected} language={language} bookmarked={selected ? bookmarks.bookmarked.has(selected.id) : false} onClose={() => setSelected(null)} onToggleBookmark={bookmarks.toggle} />
    </main>
  );
}
