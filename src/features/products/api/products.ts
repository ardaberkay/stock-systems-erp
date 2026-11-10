import {
  batchRequestCreatedSchema,
  batchRequestListSchema,
} from '@/features/products/schemas/batchRequest';
import type { ProductCreateForm } from '@/features/products/schemas/productCreate';
import { productListSchema, type Product } from '@/features/products/schemas/products';
import { useProductBatchStore } from '@/features/products/stores/productBatchStore';
import { buildProductCreatePayload } from '@/features/products/utils/productCreate';
import { useFocusSubscribed } from '@/hooks/useFocusSubscribed';
import { apiClient } from '@/lib/apiClient';
import { CACHE } from '@/lib/cachePolicy';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  byIds: (ids: number[]) => [...productKeys.all, 'byIds', ids] as const,
  batch: (batchRequestId: string) => [...productKeys.all, 'batch', batchRequestId] as const,
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

// Ekran odakta değilken dinlenmez (bkz. useFocusSubscribed); sekme açılınca katalog eskidiyse
// arkada yenilenir.
export function useProducts(options?: { enabled?: boolean }) {
  const subscribed = useFocusSubscribed(productKeys.list());

  return useQuery({
    queryKey: productKeys.list(),
    queryFn: ({ signal }) => getProducts(signal),
    ...CACHE.products,
    subscribed,
    enabled: options?.enabled,
  });
}

// Stok veya raporlar açıldıysa katalog bellekte durur; istenen ürünlerin hepsi oradaysa
// ayrıca istek atılmaz. Biri bile eksikse (yeni ürün) istek atılır.
function pickFromCatalog(queryClient: QueryClient, ids: number[]): Product[] | undefined {
  const catalog = queryClient.getQueryData<Product[]>(productKeys.list());

  if (!catalog) {
    return undefined;
  }

  const wanted = new Set(ids);
  const found = catalog.filter((product) => wanted.has(product.id));

  return found.length === wanted.size ? found : undefined;
}

export function useProductsByIds(ids: number[]) {
  const queryClient = useQueryClient();
  // Aynı ürünler farklı sırada gelince ikinci istek atılmasın
  const sortedIds = [...ids].sort((a, b) => a - b);
  const queryKey = productKeys.byIds(sortedIds);
  const subscribed = useFocusSubscribed(queryKey);

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => getProductsByIds(sortedIds, signal),
    ...CACHE.products,
    subscribed,
    enabled: sortedIds.length > 0,
    initialData: () => pickFromCatalog(queryClient, sortedIds),
    // Katalog ne zaman geldiyse veri o kadar eskidir; süresi geçtiyse arkada yenilenir
    initialDataUpdatedAt: () => queryClient.getQueryState(productKeys.list())?.dataUpdatedAt,
    // Listeye yeni ürün eklenince elde olanlar ekrandan kalkmasın
    placeholderData: keepPreviousData,
  });
}

// product/add ürünü hemen oluşturmaz: işi sıraya alır ve iş numarası döner (test 09.11.2026).
// Backend anında oluşturan bir yol açınca yalnızca bu fonksiyon ve useCreateProduct değişir.
export async function createProduct(values: ProductCreateForm) {
  const { batchRequestId } = await apiClient.post('product/add', {
    schema: batchRequestCreatedSchema,
    arguments: buildProductCreatePayload(values),
  });

  return batchRequestId;
}

export async function getProductBatch(batchRequestId: string, signal?: AbortSignal) {
  const { data } = await apiClient.post('batchRequest/get', {
    schema: batchRequestListSchema,
    arguments: { uuid: batchRequestId },
    signal,
  });

  return data[0] ?? null;
}

// İş sıraya alınınca takibe eklenir; sonuç gelince katalog yenilenir (bkz. useProductBatchWatcher)
export function useCreateProduct() {
  const addPending = useProductBatchStore((state) => state.add);

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (batchRequestId, values) => {
      addPending({ batchRequestId, productName: values.name, createdAt: Date.now() });
    },
  });
}
