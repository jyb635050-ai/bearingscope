import { useState } from 'react';
import { BookOpen, ExternalLink, Search, Unlock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { ContentItem } from '../shared/types';
import { useBookmarks } from '../lib/bookmarks';
import { formatDate, localize } from '../lib/i18n';
import { useResearch } from '../lib/queries';
import { ContentDetailDrawer, DemoNotice, EmptyState, ErrorState, LoadingState, PageHeader, Pagination, SourceBadge } from '../components/content';
import type { PageLanguageProps } from './HomePage';

function researchPage(params: URLSearchParams): number {
  const page = Number(params.get('page') ?? 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function ResearchPage({ language }: PageLanguageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookmarks = useBookmarks();
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const q = searchParams.get('q') ?? '';
  const brand = searchParams.get('brand') ?? '';
  const accessValue = searchParams.get('openAccess') ?? 'all';
  const openAccess = accessValue === 'all' ? undefined : accessValue === 'true';
  const sortValue = searchParams.get('sort');
  const sort = sortValue === 'oldest' || sortValue === 'citations' ? sortValue : 'newest';
  const page = researchPage(searchParams);
  const research = useResearch({ q, brand, openAccess, sort, page, pageSize: 20 });

  const update = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all' && !(key === 'sort' && value === 'newest')) next.set(key, value);
    else next.delete(key);
    if (resetPage) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  return (
    <main className="page page--research">
      <PageHeader
        language={language}
        title={{ zh: '论文研究', en: 'Research library' }}
        description={{ zh: '发现轴承、摩擦学、材料、润滑、故障诊断与寿命预测的学术成果。', en: 'Discover academic work on bearings, tribology, materials, lubrication, diagnostics and life prediction.' }}
        meta={<span><BookOpen aria-hidden="true" />OpenAlex · Crossref · DOI</span>}
      />
      <DemoNotice language={language} mode="policy">{language === 'zh' ? '仅展示真实论文元数据、说明性双语摘要和合法原文链接，不复制受版权保护的全文；开放获取未知时不会冒充“非开放”。' : 'Only real metadata, explanatory bilingual summaries and lawful source links are shown; copyrighted full text is not copied, and unknown OA status is not presented as closed.'}</DemoNotice>

      <form className="research-filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="research-filters__search">
          <span className="sr-only">{language === 'zh' ? '搜索论文' : 'Search research'}</span>
          <Search aria-hidden="true" />
          <input type="search" value={q} onChange={(event) => update('q', event.target.value)} placeholder={language === 'zh' ? '搜索题目、作者、期刊或 DOI…' : 'Search title, author, journal or DOI…'} />
        </label>
        <label><span>{language === 'zh' ? '开放获取' : 'Access'}</span><select value={accessValue} onChange={(event) => update('openAccess', event.target.value)}><option value="all">{language === 'zh' ? '全部论文' : 'All papers'}</option><option value="true">{language === 'zh' ? '仅开放获取' : 'Open access only'}</option><option value="false">{language === 'zh' ? '非开放获取' : 'Restricted access'}</option></select></label>
        <label><span>{language === 'zh' ? '排序' : 'Sort'}</span><select value={sort} onChange={(event) => update('sort', event.target.value)}><option value="newest">{language === 'zh' ? '最新发表' : 'Newest'}</option><option value="citations">{language === 'zh' ? '引用最多' : 'Most cited'}</option><option value="oldest">{language === 'zh' ? '最早发表' : 'Oldest'}</option></select></label>
      </form>

      {research.isLoading ? <LoadingState language={language} /> : research.isError ? <ErrorState language={language} onRetry={() => research.refetch()} /> : !research.data || research.data.items.length === 0 ? <EmptyState language={language} /> : (
        <>
          <section className="research-list" aria-label={language === 'zh' ? '论文列表' : 'Research list'}>
            {research.data.items.map((paper) => (
              <article key={paper.id} className="research-row">
                <div className="research-row__index" aria-hidden="true">{String((research.data.pagination.page - 1) * research.data.pagination.pageSize + research.data.items.indexOf(paper) + 1).padStart(2, '0')}</div>
                <div className="research-row__body">
                  <header>
                    <SourceBadge source={paper.source} language={language} />
                    {paper.openAccess && <span className="open-access"><Unlock aria-hidden="true" />{language === 'zh' ? '开放获取' : 'Open access'}</span>}
                    <time dateTime={paper.publishedAt}>{formatDate(paper.publishedAt, language)}</time>
                  </header>
                  <h2><button type="button" onClick={() => setSelected(paper)}>{localize(paper.title, language)}</button></h2>
                  <p>{localize(paper.summary, language)}</p>
                  <footer>
                    <span>{paper.authors.join(', ')}</span>
                    <span>{paper.journal}</span>
                    {paper.doi && <span>DOI {paper.doi}</span>}
                    <span>{language === 'zh' ? `引用 ${paper.citations}` : `${paper.citations} citations`}</span>
                  </footer>
                </div>
                <div className="research-row__actions">
                  <button type="button" onClick={() => bookmarks.toggle(paper.id)} aria-pressed={bookmarks.bookmarked.has(paper.id)}>{bookmarks.bookmarked.has(paper.id) ? (language === 'zh' ? '已收藏' : 'Saved') : (language === 'zh' ? '收藏' : 'Save')}</button>
                  {paper.paperUrl && <a href={paper.paperUrl} target="_blank" rel="noreferrer" aria-label={language === 'zh' ? '打开论文页面' : 'Open paper page'}><ExternalLink aria-hidden="true" /></a>}
                </div>
              </article>
            ))}
          </section>
          <Pagination pagination={research.data.pagination} language={language} onPageChange={(nextPage) => update('page', String(nextPage), false)} />
        </>
      )}

      <ContentDetailDrawer item={selected} language={language} bookmarked={selected ? bookmarks.bookmarked.has(selected.id) : false} onClose={() => setSelected(null)} onToggleBookmark={bookmarks.toggle} />
    </main>
  );
}
