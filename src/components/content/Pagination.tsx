import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination as PaginationData } from '../../shared/types';
import type { Language } from '../../lib/i18n';

interface PaginationProps {
  pagination: PaginationData;
  language: Language;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, language, onPageChange }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label={language === 'zh' ? '分页' : 'Pagination'}>
      <button type="button" onClick={() => onPageChange(pagination.page - 1)} disabled={!pagination.hasPreviousPage} aria-label={language === 'zh' ? '上一页' : 'Previous page'}>
        <ChevronLeft aria-hidden="true" />
      </button>
      <span>{language === 'zh' ? `第 ${pagination.page} / ${pagination.totalPages} 页` : `Page ${pagination.page} of ${pagination.totalPages}`}</span>
      <button type="button" onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNextPage} aria-label={language === 'zh' ? '下一页' : 'Next page'}>
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}
