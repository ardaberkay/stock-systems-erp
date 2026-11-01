import { apiClient } from '@/lib/apiClient';
import { affiliateListSchema } from '@/schemas/affiliates';
import { useQuery } from '@tanstack/react-query';

// Satış ortağı listesi sık değişmez; rate limit için tek istekle saklanır.
const AFFILIATES_CACHE_MS = 60 * 60_000;

export const affiliateKeys = {
  all: ['affiliates'] as const,
  list: () => [...affiliateKeys.all, 'list'] as const,
};

export async function getAffiliates(signal?: AbortSignal) {
  const { data } = await apiClient.post('affiliateAccount/get', {
    schema: affiliateListSchema,
    signal,
  });

  return data;
}

export function useAffiliates(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: affiliateKeys.list(),
    queryFn: ({ signal }) => getAffiliates(signal),
    staleTime: AFFILIATES_CACHE_MS,
    gcTime: AFFILIATES_CACHE_MS,
    enabled: options?.enabled,
  });
}
