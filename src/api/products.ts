import { apiClient } from '@/lib/apiClient';
import { productListSchema } from '@/schemas/products';
import { useQuery } from '@tanstack/react-query';

// Ürün adı ve görseli sık değişmez
const PRODUCTS_STALE_MS = 5 * 60_000;

export const productKeys = {
  all: ['products'] as const,
  byIds: (ids: number[]) => [...productKeys.all, 'byIds', ids] as const,
};

export async function getProductsByIds(ids: number[], signal?: AbortSignal) {
  const { data } = await apiClient.post('product/get', {
    schema: productListSchema,
    arguments: { ids },
    signal,
  });

  return data;
}

export function useProductsByIds(ids: number[], options?: { enabled?: boolean }) {
  // Aynı ürünler farklı sırada gelince ikinci istek atılmasın
  const sortedIds = [...ids].sort((a, b) => a - b);

  return useQuery({
    queryKey: productKeys.byIds(sortedIds),
    queryFn: ({ signal }) => getProductsByIds(sortedIds, signal),
    staleTime: PRODUCTS_STALE_MS,
    enabled: sortedIds.length > 0 && options?.enabled !== false,
  });
}
