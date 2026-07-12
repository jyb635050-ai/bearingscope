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

export function DemoNotice({
  language,
  children,
  mode = 'demo',
  generatedAt,
}: {
  language: Language;
  children?: React.ReactNode;
  mode?: 'demo' | 'live' | 'policy';
  generatedAt?: string;
}) {
  const label = mode === 'live'
    ? (language === 'zh' ? '真实内容快照' : 'Live content snapshot')
    : mode === 'policy'
      ? (language === 'zh' ? '内容边界' : 'Content policy')
      : (language === 'zh' ? 'V1 演示数据' : 'V1 demo data');
  const defaultBody = mode === 'live'
    ? (language === 'zh'
      ? `内容来自公开新闻索引、企业新闻页和学术元数据；只保存标题、来源与链接。${generatedAt ? ` 最近同步：${new Date(generatedAt).toLocaleString('zh-CN')}` : ''}`
      : `Content comes from public news indexes, corporate newsrooms and scholarly metadata; only metadata and links are stored.${generatedAt ? ` Last synced: ${new Date(generatedAt).toLocaleString('en')}` : ''}`)
    : (language === 'zh'
      ? '当前内容用于展示真实可接入的数据结构，不代表实时行业事实。'
      : 'Content demonstrates the live-ready data model and does not represent real-time industry facts.');
  return (
    <aside className="demo-notice" aria-label={label} data-mode={mode}>
      <span>{label}</span>
      <p>{children ?? defaultBody}</p>
    </aside>
  );
}
