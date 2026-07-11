import type { FeedFilterValues } from '../components/content/FeedFilters';

export const DEFAULT_FEED_FILTERS: FeedFilterValues = {
  q: '',
  category: '',
  brand: '',
  region: '',
  sourceType: '',
  time: 'all',
  sort: 'newest',
};

const times = new Set<FeedFilterValues['time']>(['24h', '7d', '30d', 'all']);
const sorts = new Set<FeedFilterValues['sort']>(['newest', 'oldest', 'relevance', 'confidence']);

export function parseFeedSearch(params: URLSearchParams): FeedFilterValues {
  const time = params.get('time') as FeedFilterValues['time'] | null;
  const sort = params.get('sort') as FeedFilterValues['sort'] | null;
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    brand: params.get('brand') ?? '',
    region: params.get('region') ?? '',
    sourceType: params.get('sourceType') ?? '',
    time: time && times.has(time) ? time : DEFAULT_FEED_FILTERS.time,
    sort: sort && sorts.has(sort) ? sort : DEFAULT_FEED_FILTERS.sort,
  };
}

export function serializeFeedSearch(filters: FeedFilterValues, page = 1): URLSearchParams {
  const params = new URLSearchParams();
  (Object.entries(filters) as [keyof FeedFilterValues, string][]).forEach(([key, value]) => {
    if (value && value !== DEFAULT_FEED_FILTERS[key]) params.set(key, value);
  });
  if (page > 1) params.set('page', String(page));
  return params;
}

export function parsePage(params: URLSearchParams): number {
  const page = Number(params.get('page') ?? 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
