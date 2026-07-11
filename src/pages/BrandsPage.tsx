import { useEffect, useState } from 'react';
import { Building2, MapPin, MessageCircleMore, RadioTower } from 'lucide-react';
import type { ContentItem } from '../shared/types';
import { localize } from '../lib/i18n';
import { useBookmarks } from '../lib/bookmarks';
import { useBrands } from '../lib/queries';
import { ContentDetailDrawer, ContentList, DemoNotice, EmptyState, ErrorState, LoadingState, PageHeader } from '../components/content';
import type { PageLanguageProps } from './HomePage';

export function BrandsPage({ language }: PageLanguageProps) {
  const brands = useBrands();
  const bookmarks = useBookmarks();
  const [activeId, setActiveId] = useState('');
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const items = brands.data?.items ?? [];

  useEffect(() => {
    if (!activeId && items[0]) setActiveId(items[0].brand.id);
  }, [activeId, items]);

  const active = items.find(({ brand }) => brand.id === activeId) ?? items[0];

  return (
    <main className="page page--brands">
      <PageHeader
        language={language}
        title={{ zh: '品牌雷达', en: 'Brand radar' }}
        description={{ zh: '追踪全球十家重点轴承品牌的官方动态、媒体关注与微信公众号线索。', en: 'Track official updates, media attention and WeChat signals from ten major bearing brands.' }}
        meta={<span><RadioTower aria-hidden="true" />{language === 'zh' ? '编辑关注名单 · 非市场排名' : 'Editorial watch list · not a market ranking'}</span>}
      />
      <DemoNotice language={language}>{brands.data ? localize(brands.data.disclaimer, language) : undefined}</DemoNotice>

      {brands.isLoading ? <LoadingState language={language} /> : brands.isError ? <ErrorState language={language} onRetry={() => brands.refetch()} /> : !active ? <EmptyState language={language} /> : (
        <div className="brand-radar">
          <nav className="brand-radar__index" aria-label={language === 'zh' ? '品牌关注名单' : 'Brand watch list'}>
            <ol>
              {items.map(({ brand, mentionCount }, index) => (
                <li key={brand.id}>
                  <button type="button" className={brand.id === active.brand.id ? 'is-active' : ''} onClick={() => setActiveId(brand.id)} aria-current={brand.id === active.brand.id ? 'true' : undefined}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span><strong>{brand.shortName}</strong><small>{localize(brand.country, language)}</small></span>
                    <span>{mentionCount}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <section className="brand-profile" aria-labelledby="brand-profile-title">
            <header className="brand-profile__header">
              <div className="brand-monogram" aria-hidden="true">{active.brand.shortName.slice(0, 3)}</div>
              <div>
                <h2 id="brand-profile-title">{localize(active.brand.name, language)}</h2>
                <p><MapPin aria-hidden="true" />{localize(active.brand.country, language)} · {language === 'zh' ? `${active.mentionCount} 条演示动态` : `${active.mentionCount} demo mentions`}</p>
              </div>
            </header>

            <dl className="brand-profile__facts">
              <div><dt>{language === 'zh' ? '品牌别名' : 'Aliases'}</dt><dd>{active.brand.aliases.join(' · ')}</dd></div>
              <div>
                <dt><MessageCircleMore aria-hidden="true" />{language === 'zh' ? '微信公众号显示名称' : 'WeChat display names'}</dt>
                <dd>{active.brand.wechatDisplayNames.length > 0 ? active.brand.wechatDisplayNames.join(' · ') : (language === 'zh' ? '待认证映射' : 'Pending verified mapping')}</dd>
              </div>
            </dl>

            <section className="brand-profile__latest" aria-labelledby="brand-latest-title">
              <header className="section-heading"><h3 id="brand-latest-title"><Building2 aria-hidden="true" />{language === 'zh' ? '最新相关动态' : 'Latest activity'}</h3></header>
              {active.latestItems.length > 0 ? <ContentList items={active.latestItems} language={language} bookmarkedIds={bookmarks.bookmarked} variant="compact" onOpen={setSelected} onToggleBookmark={bookmarks.toggle} /> : <EmptyState language={language} />}
            </section>
          </section>
        </div>
      )}

      <ContentDetailDrawer item={selected} language={language} bookmarked={selected ? bookmarks.bookmarked.has(selected.id) : false} onClose={() => setSelected(null)} onToggleBookmark={bookmarks.toggle} />
    </main>
  );
}
