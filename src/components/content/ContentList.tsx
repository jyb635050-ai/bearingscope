import type { ContentItem } from '../../shared/types';
import type { Language } from '../../lib/i18n';
import { ContentCard } from './ContentCard';

interface ContentListProps {
  items: ContentItem[];
  language: Language;
  bookmarkedIds?: ReadonlySet<string>;
  variant?: 'default' | 'timeline' | 'compact';
  onOpen: (item: ContentItem) => void;
  onToggleBookmark: (id: string) => void;
  ariaLabel?: string;
}

export function ContentList({
  items,
  language,
  bookmarkedIds = new Set(),
  variant = 'default',
  onOpen,
  onToggleBookmark,
  ariaLabel,
}: ContentListProps) {
  return (
    <div className={`content-list content-list--${variant}`} role="feed" aria-label={ariaLabel}>
      {items.map((item) => (
        <ContentCard
          key={item.id}
          item={item}
          language={language}
          bookmarked={bookmarkedIds.has(item.id)}
          variant={variant}
          onOpen={onOpen}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
