import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bearingApi, type FeedParams, type ResearchParams, type WechatImportInput } from './api';

export const queryKeys = {
  feed: (params: FeedParams) => ['feed', params] as const,
  trending: ['trending'] as const,
  brands: ['brands'] as const,
  market: ['market'] as const,
  research: (params: ResearchParams) => ['research', params] as const,
  sources: ['sources'] as const,
};

const queryDefaults = {
  staleTime: 60_000,
  retry: 1,
} as const;

export function useFeed(params: FeedParams = {}) {
  return useQuery({ queryKey: queryKeys.feed(params), queryFn: () => bearingApi.feed(params), ...queryDefaults });
}

export function useTrending() {
  return useQuery({ queryKey: queryKeys.trending, queryFn: bearingApi.trending, ...queryDefaults });
}

export function useBrands() {
  return useQuery({ queryKey: queryKeys.brands, queryFn: bearingApi.brands, ...queryDefaults });
}

export function useMarket() {
  return useQuery({ queryKey: queryKeys.market, queryFn: bearingApi.market, ...queryDefaults });
}

export function useResearch(params: ResearchParams = {}) {
  return useQuery({ queryKey: queryKeys.research(params), queryFn: () => bearingApi.research(params), ...queryDefaults });
}

export function useSources() {
  return useQuery({ queryKey: queryKeys.sources, queryFn: bearingApi.sources, staleTime: 5 * 60_000, retry: 1 });
}

export function useWechatImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WechatImportInput) => bearingApi.importWechat(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sources }),
  });
}
