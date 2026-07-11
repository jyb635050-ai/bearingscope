import { useEffect } from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, X } from 'lucide-react';
import type { ContentItem } from '../../shared/types';
import { formatDate, localize, type Language, ui } from '../../lib/i18n';
import { categoryLabel, kindLabel } from './contentLabels';
import { SourceBadge } from './SourceBadge';

export interface ContentDetailDrawerProps {
  item: ContentItem | null;
  language: Language;
  bookmarked?: boolean;
  onClose: () => void;
  onToggleBookmark?: (id: string) => void;
}

export function ContentDetailDrawer({ item, language, bookmarked = false, onClose, onToggleBookmark }: ContentDetailDrawerProps) {
  const c = ui(language);

  useEffect(() => {
    if (!item) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [item, onClose]);

  if (!item) return null;
  const title = localize(item.title, language);
  const sourceUrl = item.url ?? item.canonicalUrl ?? (item.kind === 'research' ? item.paperUrl : undefined);

  return (
    <aside className="detail-drawer" role="dialog" aria-modal="false" aria-labelledby="detail-drawer-title">
      <header className="detail-drawer__header">
        <div>
          <span className="detail-drawer__kind">{kindLabel(item.kind, language)}</span>
          <h2 id="detail-drawer-title">{title}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label={c.close} autoFocus>
          <X aria-hidden="true" />
        </button>
      </header>

      <div className="detail-drawer__scroll">
        {item.originalTitle && item.originalTitle !== title && (
          <p className="detail-drawer__original-title" lang={item.originalLanguage}>{item.originalTitle}</p>
        )}
        <p className="detail-drawer__summary">{localize(item.summary, language)}</p>

        <dl className="detail-metadata">
          <div>
            <dt>{c.source}</dt>
            <dd><SourceBadge source={item.source} language={language} /></dd>
          </div>
          <div>
            <dt>{c.published}</dt>
            <dd><time dateTime={item.publishedAt}>{formatDate(item.publishedAt, language, { dateStyle: 'medium', timeStyle: 'short' })}</time></dd>
          </div>
          <div>
            <dt>{c.fetched}</dt>
            <dd><time dateTime={item.fetchedAt}>{formatDate(item.fetchedAt, language, { dateStyle: 'medium', timeStyle: 'short' })}</time></dd>
          </div>
          <div>
            <dt>{c.confidence}</dt>
            <dd className="confidence-meter"><ShieldCheck aria-hidden="true" /> {Math.round(item.confidence * 100)}%</dd>
          </div>
        </dl>

        {item.keyFacts.length > 0 && (
          <section className="detail-drawer__section">
            <h3>{c.keyFacts}</h3>
            <ul className="key-facts">
              {item.keyFacts.map((fact, index) => <li key={`${item.id}-fact-${index}`}>{localize(fact, language)}</li>)}
            </ul>
          </section>
        )}

        {item.kind === 'finance' && Object.keys(item.metrics).length > 0 && (
          <section className="detail-drawer__section">
            <h3>{language === 'zh' ? '披露指标' : 'Reported metrics'}</h3>
            <dl className="metric-list">
              {Object.entries(item.metrics).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          </section>
        )}

        {item.kind === 'market' && (
          <section className="detail-drawer__section detail-drawer__signal">
            <h3>{language === 'zh' ? '信号阶段' : 'Signal stage'}</h3>
            <p>{item.horizon} · {item.maturity}</p>
          </section>
        )}

        {item.kind === 'research' && (
          <section className="detail-drawer__section research-metadata">
            <h3>{language === 'zh' ? '论文信息' : 'Paper metadata'}</h3>
            <p>{item.authors.join(', ')}</p>
            <p>{item.journal}{item.doi ? ` · DOI ${item.doi}` : ''}</p>
            <p>{language === 'zh' ? `引用 ${item.citations} 次` : `${item.citations} citations`} · {item.openAccess ? (language === 'zh' ? '开放获取' : 'Open access') : (language === 'zh' ? '非开放获取' : 'Access restricted')}</p>
          </section>
        )}

        <ul className="tag-list detail-drawer__tags">
          {item.categories.map((category) => <li key={category}>{categoryLabel(category, language)}</li>)}
        </ul>

        {item.relatedSourceUrls.length > 0 && (
          <section className="detail-drawer__section">
            <h3>{c.relatedSources}</h3>
            <ul className="related-source-list">
              {item.relatedSourceUrls.map((url, index) => (
                <li key={url}><a href={url} target="_blank" rel="noreferrer">{language === 'zh' ? `关联报道 ${index + 1}` : `Related report ${index + 1}`}<ExternalLink aria-hidden="true" /></a></li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="detail-drawer__footer">
        {onToggleBookmark && (
          <button type="button" className={`button button--secondary${bookmarked ? ' is-active' : ''}`} onClick={() => onToggleBookmark(item.id)} aria-pressed={bookmarked}>
            {bookmarked ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
            {bookmarked ? c.saved : c.save}
          </button>
        )}
        {sourceUrl && <a className="button button--primary" href={sourceUrl} target="_blank" rel="noreferrer">{c.original}<ExternalLink aria-hidden="true" /></a>}
      </footer>
    </aside>
  );
}
