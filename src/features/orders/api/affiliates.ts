import { affiliateListSchema } from '@/features/orders/schemas/affiliates';
import { apiClient } from '@/lib/apiClient';
import { CACHE } from '@/lib/cachePolicy';
import { useQuery } from '@tanstack/react-query';

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
    ...CACHE.lookups,
    enabled: options?.enabled,
  });
}
