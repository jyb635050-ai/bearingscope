import { Bookmark, BookmarkCheck, ChevronRight, ExternalLink, FileText, Radio, TrendingUp } from 'lucide-react';
import type { ContentItem } from '../../shared/types';
import { formatRelativeTime, localize, type Language, ui } from '../../lib/i18n';
import { categoryLabel, kindLabel } from './contentLabels';
import { SourceBadge } from './SourceBadge';

export interface ContentCardProps {
  item: ContentItem;
  language: Language;
  bookmarked?: boolean;
  variant?: 'default' | 'timeline' | 'compact';
  onOpen?: (item: ContentItem) => void;
  onToggleBookmark?: (id: string) => void;
}

function KindIcon({ kind }: Pick<ContentItem, 'kind'>) {
  if (kind === 'research') return <FileText aria-hidden="true" />;
  if (kind === 'finance') return <TrendingUp aria-hidden="true" />;
  return <Radio aria-hidden="true" />;
}

export function ContentCard({
  item,
  language,
  bookmarked = false,
  variant = 'default',
  onOpen,
  onToggleBookmark,
}: ContentCardProps) {
  const c = ui(language);
  const sourceUrl = item.url ?? item.canonicalUrl ?? (item.kind === 'research' ? item.paperUrl : undefined);
  const title = localize(item.title, language);

  return (
    <article className={`content-card content-card--${variant} content-card--${item.kind}`} data-content-id={item.id}>
      <header className="content-card__header">
        <div className="content-card__eyeline">
          <span className="content-card__kind">
            <KindIcon kind={item.kind} />
            {kindLabel(item.kind, language)}
          </span>
          <SourceBadge source={item.source} language={language} showType={false} />
          <time dateTime={item.publishedAt}>{formatRelativeTime(item.publishedAt, language)}</time>
        </div>
        {onToggleBookmark && (
          <button
            className={`bookmark-button${bookmarked ? ' bookmark-button--active' : ''}`}
            type="button"
            onClick={() => onToggleBookmark(item.id)}
            aria-pressed={bookmarked}
            aria-label={`${bookmarked ? c.saved : c.save}: ${title}`}
          >
            {bookmarked ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
          </button>
        )}
      </header>

      <div className="content-card__body">
        <h3>{onOpen ? <button type="button" onClick={() => onOpen(item)}>{title}</button> : title}</h3>
        {variant !== 'compact' && <p>{localize(item.summary, language)}</p>}
      </div>

      <footer className="content-card__footer">
        <ul className="tag-list" aria-label={language === 'zh' ? '分类' : 'Categories'}>
          {item.categories.slice(0, variant === 'compact' ? 1 : 3).map((category) => (
            <li key={category}>{categoryLabel(category, language)}</li>
          ))}
          {item.demo && <li className="tag-list__demo">{c.demo}</li>}
        </ul>
        <div className="content-card__actions">
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noreferrer" aria-label={`${c.original}: ${title}`}>
              <ExternalLink aria-hidden="true" />
              <span>{c.original}</span>
            </a>
          )}
          {onOpen && (
            <button type="button" onClick={() => onOpen(item)}>
              <span>{c.details}</span>
              <ChevronRight aria-hidden="true" />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
