import { apiClient } from '@/lib/apiClient';
import { productListSchema } from '@/schemas/products';
import { useQuery } from '@tanstack/react-query';

// Ürün adı ve görseli sık değişmez
const PRODUCTS_STALE_MS = 5 * 60_000;
// Tüm katalog büyük bir yanıt; uygulama açılışında ve aşağı çekince gelir, süre yalnızca
// uygulama arka planda donup kaldığında eski stoğun görünmesini engeller.
const PRODUCT_LIST_CACHE_MS = 60 * 60_000;

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  byIds: (ids: number[]) => [...productKeys.all, 'byIds', ids] as const,
};

// API sayfalama yapmaz; tüm katalog tek yanıtta gelir.
export async function getProducts(signal?: AbortSignal) {
  const { data } = await apiClient.post('product/get', {
    schema: productListSchema,
    signal,
  });

  return data;
}

export async function getProductsByIds(ids: number[], signal?: AbortSignal) {
  const { data } = await apiClient.post('product/get', {
    schema: productListSchema,
    arguments: { ids },
    signal,
  });

  return data;
}

export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: ({ signal }) => getProducts(signal),
    staleTime: PRODUCT_LIST_CACHE_MS,
    gcTime: PRODUCT_LIST_CACHE_MS,
  });
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
