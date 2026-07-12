import { useState } from 'react';
import { ArrowRight, Clock3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ContentItem } from '../shared/types';
import type { Language } from '../lib/i18n';
import { useBookmarks } from '../lib/bookmarks';
import { useBrands, useFeed, useTrending } from '../lib/queries';
import {
  BrandAttentionPanel,
  ContentCard,
  ContentDetailDrawer,
  ContentList,
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  TrendingPanel,
} from '../components/content';

export interface PageLanguageProps {
  language: Language;
}

export function HomePage({ language }: PageLanguageProps) {
  const feed = useFeed({ time: 'all', sort: 'newest', page: 1, pageSize: 12 });
  const trending = useTrending();
  const brands = useBrands();
  const bookmarks = useBookmarks();
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const items = feed.data?.items ?? [];
  const featured = items.find((item) => item.source.tier === 'official') ?? items[0];
  const timeline = items.filter((item) => item.id !== featured?.id);

  return (
    <main className="page page--home">
      <PageHeader
        language={language}
        title={{ zh: '全球轴承情报', en: 'Global bearing intelligence' }}
        description={{ zh: '制造、市场与技术信号，一处掌握。', en: 'Manufacturing, market and technology signals in one place.' }}
        meta={(
          <>
            <span><Sparkles aria-hidden="true" />{language === 'zh' ? '多信源聚合 · 双语摘要 · 信源分级' : 'Multi-source · bilingual summaries · source grading'}</span>
            <nav className="hero-categories" aria-label={language === 'zh' ? '内容分类' : 'Content categories'}>
              <Link className="is-active" to="/news">{language === 'zh' ? '全部' : 'All'}</Link>
              <Link to="/news?category=company">{language === 'zh' ? '公司' : 'Company'}</Link>
              <Link to="/news?category=finance">{language === 'zh' ? '财务' : 'Finance'}</Link>
              <Link to="/news?category=product">{language === 'zh' ? '产品' : 'Products'}</Link>
              <Link to="/news?category=technology">{language === 'zh' ? '技术' : 'Technology'}</Link>
              <Link to="/news?category=market">{language === 'zh' ? '市场' : 'Market'}</Link>
              <Link to="/research">{language === 'zh' ? '论文' : 'Papers'}</Link>
            </nav>
          </>
        )}
      >
        <Link className="button button--secondary" to="/news">{language === 'zh' ? '浏览全部动态' : 'Explore all news'}<ArrowRight aria-hidden="true" /></Link>
      </PageHeader>

      <DemoNotice
        language={language}
        mode={feed.data?.demo === true ? 'demo' : 'live'}
        generatedAt={trending.data?.generatedAt}
      />

      {trending.isLoading ? <LoadingState language={language} /> : trending.isError ? <ErrorState language={language} onRetry={() => trending.refetch()} /> : trending.data && (
        <TrendingPanel
          topics={trending.data.topics}
          language={language}
          onSelectTopic={(itemId) => setSelected(items.find((item) => item.id === itemId) ?? null)}
        />
      )}

      {feed.isLoading ? <LoadingState language={language} /> : feed.isError ? <ErrorState language={language} onRetry={() => feed.refetch()} /> : items.length === 0 ? <EmptyState language={language} /> : (
        <div className="home-dashboard">
          <div className="home-dashboard__feed">
            {featured && (
              <section className="featured-story" aria-labelledby="featured-heading">
                <header className="section-heading">
                  <h2 id="featured-heading">{language === 'zh' ? '重点报道' : 'Featured intelligence'}</h2>
                  <span>{language === 'zh' ? '最近发布' : 'Most recent'}</span>
                </header>
                <ContentCard item={featured} language={language} bookmarked={bookmarks.bookmarked.has(featured.id)} onOpen={setSelected} onToggleBookmark={bookmarks.toggle} />
              </section>
            )}
            <section className="latest-timeline" aria-labelledby="timeline-heading">
              <header className="section-heading">
                <h2 id="timeline-heading"><Clock3 aria-hidden="true" />{language === 'zh' ? '最新时间线' : 'Latest timeline'}</h2>
                <Link to="/news">{language === 'zh' ? '查看全部' : 'View all'}<ArrowRight aria-hidden="true" /></Link>
              </header>
              <ContentList items={timeline} language={language} bookmarkedIds={bookmarks.bookmarked} variant="timeline" onOpen={setSelected} onToggleBookmark={bookmarks.toggle} />
            </section>
          </div>
          <aside className="home-dashboard__rail">
            {brands.data && trending.data && <BrandAttentionPanel attention={trending.data.brandAttention} brands={brands.data.items} language={language} />}
            <section className="coverage-summary">
              <h2>{language === 'zh' ? '重点覆盖' : 'Coverage focus'}</h2>
              <ul>
                <li><span>{language === 'zh' ? '企业与资本' : 'Corporate & capital'}</span><strong>{language === 'zh' ? '财报 / 并购 / 重组' : 'Earnings / M&A / restructuring'}</strong></li>
                <li><span>{language === 'zh' ? '产品与技术' : 'Product & technology'}</span><strong>{language === 'zh' ? '新品 / 材料 / 智能监测' : 'Launches / materials / monitoring'}</strong></li>
                <li><span>{language === 'zh' ? '产业与研究' : 'Industry & research'}</span><strong>{language === 'zh' ? '产能 / 市场 / 学术发现' : 'Capacity / markets / findings'}</strong></li>
              </ul>
            </section>
          </aside>
        </div>
      )}

      <ContentDetailDrawer item={selected} language={language} bookmarked={selected ? bookmarks.bookmarked.has(selected.id) : false} onClose={() => setSelected(null)} onToggleBookmark={bookmarks.toggle} />
    </main>
  );
}
