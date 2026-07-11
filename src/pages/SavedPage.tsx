import { useMemo, useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import type { ContentItem } from '../shared/types';
import { useBookmarks } from '../lib/bookmarks';
import { useFeed, useMarket, useResearch } from '../lib/queries';
import { ContentDetailDrawer, ContentList, EmptyState, ErrorState, LoadingState, PageHeader } from '../components/content';
import type { PageLanguageProps } from './HomePage';

export function SavedPage({ language }: PageLanguageProps) {
  const bookmarks = useBookmarks();
  const feed = useFeed({ time: 'all', page: 1, pageSize: 100 });
  const market = useMarket();
  const research = useResearch({ page: 1, pageSize: 100 });
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const loading = feed.isLoading || market.isLoading || research.isLoading;
  const error = feed.isError || market.isError || research.isError;
  const items = useMemo(() => {
    const all: ContentItem[] = [...(feed.data?.items ?? []), ...(market.data?.items ?? []), ...(research.data?.items ?? [])];
    const byId = new Map(all.map((item) => [item.id, item]));
    return bookmarks.ids.map((id) => byId.get(id)).filter((item): item is ContentItem => Boolean(item));
  }, [bookmarks.ids, feed.data, market.data, research.data]);

  return (
    <main className="page page--saved">
      <PageHeader
        language={language}
        title={{ zh: '收藏', en: 'Saved intelligence' }}
        description={{ zh: '保存在当前浏览器中的新闻、趋势与论文，便于稍后集中研读。', en: 'News, signals and papers saved in this browser for focused review.' }}
        meta={<span><Bookmark aria-hidden="true" />{language === 'zh' ? `${bookmarks.ids.length} 条已收藏` : `${bookmarks.ids.length} saved`}</span>}
      >
        {bookmarks.ids.length > 0 && <button type="button" className="button button--danger" onClick={bookmarks.clear}><Trash2 aria-hidden="true" />{language === 'zh' ? '清空收藏' : 'Clear saved'}</button>}
      </PageHeader>

      {loading ? <LoadingState language={language} /> : error ? <ErrorState language={language} onRetry={() => { feed.refetch(); market.refetch(); research.refetch(); }} /> : items.length === 0 ? <EmptyState language={language} title={language === 'zh' ? '还没有收藏' : 'Nothing saved yet'} body={language === 'zh' ? '在任意新闻、趋势或论文旁点击收藏图标，即可在这里查看。' : 'Use the save control on any news item, signal or paper to keep it here.'} /> : (
        <ContentList items={items} language={language} bookmarkedIds={bookmarks.bookmarked} onOpen={setSelected} onToggleBookmark={bookmarks.toggle} ariaLabel={language === 'zh' ? '收藏内容' : 'Saved content'} />
      )}

      <ContentDetailDrawer item={selected} language={language} bookmarked={selected ? bookmarks.bookmarked.has(selected.id) : false} onClose={() => setSelected(null)} onToggleBookmark={bookmarks.toggle} />
    </main>
  );
}
