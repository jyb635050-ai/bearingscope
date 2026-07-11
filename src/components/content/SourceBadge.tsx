import { BadgeCheck, MessageCircleMore } from 'lucide-react';
import type { SourceRecord } from '../../shared/types';
import { localize, type Language } from '../../lib/i18n';
import { sourceTypeLabel } from './contentLabels';

interface SourceBadgeProps {
  source: SourceRecord;
  language: Language;
  showType?: boolean;
}

export function SourceBadge({ source, language, showType = true }: SourceBadgeProps) {
  const isWechat = source.type === 'wechat';
  return (
    <span className={`source-badge source-badge--${source.tier}`} title={sourceTypeLabel(source.type, language)}>
      {isWechat ? <MessageCircleMore aria-hidden="true" /> : source.verified ? <BadgeCheck aria-hidden="true" /> : null}
      <span>{localize(source.name, language)}</span>
      {showType && <span className="source-badge__type">{sourceTypeLabel(source.type, language)}</span>}
    </span>
  );
}
