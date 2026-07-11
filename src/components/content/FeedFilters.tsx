import { RotateCcw, Search } from 'lucide-react';
import type { ContentCategory, SourceType } from '../../shared/types';
import type { FeedParams } from '../../lib/api';
import type { Language } from '../../lib/i18n';
import { categoryLabels, sourceTypeLabels } from './contentLabels';

export type FeedFilterValues = Required<Pick<FeedParams, 'q' | 'category' | 'brand' | 'region' | 'sourceType' | 'time' | 'sort'>>;

export interface FilterOption {
  value: string;
  label: string;
}

interface FeedFiltersProps {
  language: Language;
  value: FeedFilterValues;
  brandOptions?: FilterOption[];
  regionOptions?: FilterOption[];
  onChange: (value: FeedFilterValues) => void;
  onReset: () => void;
}

const categories = Object.keys(categoryLabels) as ContentCategory[];
const sourceTypes: SourceType[] = ['official', 'wechat', 'journal', 'regulator', 'wire', 'rss', 'demo'];
const defaultRegions = ['Global', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

export function FeedFilters({ language, value, brandOptions = [], regionOptions, onChange, onReset }: FeedFiltersProps) {
  const all = language === 'zh' ? '全部' : 'All';
  const set = <K extends keyof FeedFilterValues>(key: K, next: FeedFilterValues[K]) => onChange({ ...value, [key]: next });

  return (
    <form className="feed-filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="feed-filters__search">
        <span className="sr-only">{language === 'zh' ? '搜索标题、摘要和正文' : 'Search titles and summaries'}</span>
        <Search aria-hidden="true" />
        <input
          type="search"
          value={value.q}
          onChange={(event) => set('q', event.target.value)}
          placeholder={language === 'zh' ? '搜索标题、摘要、品牌或技术…' : 'Search titles, summaries, brands or technology…'}
        />
      </label>

      <div className="feed-filters__controls">
        <label>
          <span>{language === 'zh' ? '类别' : 'Category'}</span>
          <select value={value.category} onChange={(event) => set('category', event.target.value)}>
            <option value="">{all}</option>
            {categories.map((category) => <option key={category} value={category}>{categoryLabels[category][language]}</option>)}
          </select>
        </label>
        <label>
          <span>{language === 'zh' ? '品牌' : 'Brand'}</span>
          <select value={value.brand} onChange={(event) => set('brand', event.target.value)}>
            <option value="">{all}</option>
            {brandOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>{language === 'zh' ? '地区' : 'Region'}</span>
          <select value={value.region} onChange={(event) => set('region', event.target.value)}>
            <option value="">{all}</option>
            {(regionOptions ?? defaultRegions.map((region) => ({ value: region, label: region }))).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>{language === 'zh' ? '信源' : 'Source'}</span>
          <select value={value.sourceType} onChange={(event) => set('sourceType', event.target.value)}>
            <option value="">{all}</option>
            {sourceTypes.map((type) => <option key={type} value={type}>{sourceTypeLabels[type][language]}</option>)}
          </select>
        </label>
        <label>
          <span>{language === 'zh' ? '时间' : 'Time'}</span>
          <select value={value.time} onChange={(event) => set('time', event.target.value as FeedFilterValues['time'])}>
            <option value="24h">{language === 'zh' ? '24 小时' : '24 hours'}</option>
            <option value="7d">{language === 'zh' ? '7 天' : '7 days'}</option>
            <option value="30d">{language === 'zh' ? '30 天' : '30 days'}</option>
            <option value="all">{language === 'zh' ? '不限' : 'Any time'}</option>
          </select>
        </label>
        <label>
          <span>{language === 'zh' ? '排序' : 'Sort'}</span>
          <select value={value.sort} onChange={(event) => set('sort', event.target.value as FeedFilterValues['sort'])}>
            <option value="newest">{language === 'zh' ? '最新发布' : 'Newest'}</option>
            <option value="relevance">{language === 'zh' ? '相关度' : 'Relevance'}</option>
            <option value="confidence">{language === 'zh' ? '可信度' : 'Confidence'}</option>
            <option value="oldest">{language === 'zh' ? '最早发布' : 'Oldest'}</option>
          </select>
        </label>
        <button type="button" className="feed-filters__reset" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          {language === 'zh' ? '重置' : 'Reset'}
        </button>
      </div>
    </form>
  );
}
