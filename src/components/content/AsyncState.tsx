import { AlertTriangle, Database, LoaderCircle, RotateCcw } from 'lucide-react';
import type { Language } from '../../lib/i18n';
import { ui } from '../../lib/i18n';

export function LoadingState({ language }: { language: Language }) {
  return <div className="async-state async-state--loading" role="status"><LoaderCircle aria-hidden="true" /><p>{ui(language).loading}</p></div>;
}

export function ErrorState({ language, onRetry }: { language: Language; onRetry?: () => void }) {
  const c = ui(language);
  return (
    <div className="async-state async-state--error" role="alert">
      <AlertTriangle aria-hidden="true" />
      <h3>{c.errorTitle}</h3>
      {onRetry && <button type="button" className="button button--secondary" onClick={onRetry}><RotateCcw aria-hidden="true" />{c.retry}</button>}
    </div>
  );
}

export function EmptyState({ language, title, body }: { language: Language; title?: string; body?: string }) {
  const c = ui(language);
  return (
    <div className="async-state async-state--empty">
      <Database aria-hidden="true" />
      <h3>{title ?? c.emptyTitle}</h3>
      <p>{body ?? c.emptyBody}</p>
    </div>
  );
}

export function DemoNotice({ language, children }: { language: Language; children?: React.ReactNode }) {
  return (
    <aside className="demo-notice" aria-label={language === 'zh' ? '演示说明' : 'Demo notice'}>
      <span>{language === 'zh' ? 'V1 演示数据' : 'V1 demo data'}</span>
      <p>{children ?? (language === 'zh' ? '当前内容用于展示真实可接入的数据结构，不代表实时行业事实。' : 'Content demonstrates the live-ready data model and does not represent real-time industry facts.')}</p>
    </aside>
  );
}
