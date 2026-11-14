import type { AffiliateUpdate } from '@/features/affiliates/affiliateEdit';
import { affiliateListSchema } from '@/features/affiliates/schemas/affiliates';
import { useFocusSubscribed } from '@/hooks/useFocusSubscribed';
import { apiClient } from '@/lib/apiClient';
import { CACHE } from '@/lib/cachePolicy';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const affiliateKeys = {
  all: ['affiliates'] as const,
  list: () => [...affiliateKeys.all, 'list'] as const,
};

// Pasif ortaklar da gelir (status 0); panel yalnızca aktifleri listeler.
export async function getAffiliates(signal?: AbortSignal) {
  const { data } = await apiClient.post('affiliateAccount/get', {
    schema: affiliateListSchema,
    signal,
  });

  return data;
}

export function useAffiliates(options?: { enabled?: boolean }) {
  const queryKey = affiliateKeys.list();
  const subscribed = useFocusSubscribed(queryKey);

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => getAffiliates(signal),
    ...CACHE.lookups,
    enabled: options?.enabled,
    subscribed,
  });
}

// Yanıtın biçimi henüz görülmedi (ilk kayıt testinde bakılacak); başarı zarftaki status'tan anlaşılır
export async function updateAffiliate(id: number, changes: AffiliateUpdate) {
  await apiClient.post('affiliateAccount/update', {
    schema: z.unknown(),
    arguments: { selectArguments: { id }, updateArguments: changes },
  });
}

export function useUpdateAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: AffiliateUpdate }) =>
      updateAffiliate(id, changes),
    // Ortak adları siparişlerde ve raporlarda da bu listeden gelir
    onSettled: () => queryClient.invalidateQueries({ queryKey: affiliateKeys.all }),
  });
}
