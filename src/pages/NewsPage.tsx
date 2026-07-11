import { useState } from 'react';
import { Filter, Radio } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { ContentItem } from '../shared/types';
import type { Language } from '../lib/i18n';
import { localize } from '../lib/i18n';
import { useBookmarks } from '../lib/bookmarks';
import { DEFAULT_FEED_FILTERS, parseFeedSearch, parsePage, serializeFeedSearch } from '../lib/feedUrlState';
import { useBrands, useFeed } from '../lib/queries';
import {
  ContentDetailDrawer,
  ContentList,
  DemoNotice,
  EmptyState,
  ErrorState,
  FeedFilters,
  LoadingState,
  PageHeader,
  Pagination,
  WechatImportForm,
} from '../components/content';
import type { PageLanguageProps } from './HomePage';

export function NewsPage({ language }: PageLanguageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFeedSearch(searchParams);
  const page = parsePage(searchParams);
  const feed = useFeed({ ...filters, page, pageSize: 20 });
  const brands = useBrands();
  const bookmarks = useBookmarks();
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const brandOptions = (brands.data?.items ?? []).map(({ brand }) => ({ value: brand.id, label: localize(brand.name, language) }));

  return (
    <main className="page page--news">
      <PageHeader
        language={language}
        title={{ zh: '全部动态', en: 'All intelligence' }}
        description={{ zh: '按类别、品牌、地区、信源和时间精准筛选全球轴承行业动态。', en: 'Filter global bearing intelligence by topic, brand, region, source and time.' }}
        meta={<span><Radio aria-hidden="true" />{language === 'zh' ? '筛选条件可复制分享' : 'Shareable filter URLs'}</span>}
      />

      <FeedFilters
        language={language}
        value={filters}
        brandOptions={brandOptions}
        onChange={(next) => setSearchParams(serializeFeedSearch(next, 1), { replace: true })}
        onReset={() => setSearchParams(serializeFeedSearch(DEFAULT_FEED_FILTERS), { replace: true })}
      />

      <div className="feed-toolbar">
        <p><Filter aria-hidden="true" />{feed.data ? (language === 'zh' ? `找到 ${feed.data.pagination.total} 条信息` : `${feed.data.pagination.total} results`) : (language === 'zh' ? '正在筛选' : 'Filtering')}</p>
        <WechatImportForm language={language} brands={(brands.data?.items ?? []).map(({ brand }) => brand)} />
      </div>

      <DemoNotice language={language} />

      {feed.isLoading ? <LoadingState language={language} /> : feed.isError ? <ErrorState language={language} onRetry={() => feed.refetch()} /> : !feed.data || feed.data.items.length === 0 ? <EmptyState language={language} /> : (
        <>
          <ContentList items={feed.data.items} language={language} bookmarkedIds={bookmarks.bookmarked} onOpen={setSelected} onToggleBookmark={bookmarks.toggle} ariaLabel={language === 'zh' ? '行业动态列表' : 'Industry intelligence list'} />
          <Pagination pagination={feed.data.pagination} language={language} onPageChange={(nextPage) => setSearchParams(serializeFeedSearch(filters, nextPage))} />
        </>
      )}

      <ContentDetailDrawer item={selected} language={language} bookmarked={selected ? bookmarks.bookmarked.has(selected.id) : false} onClose={() => setSelected(null)} onToggleBookmark={bookmarks.toggle} />
    </main>
  );
}
