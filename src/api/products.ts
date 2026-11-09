import { apiClient } from '@/lib/apiClient';
import { batchRequestCreatedSchema, batchRequestListSchema } from '@/schemas/batchRequest';
import type { ProductCreateForm } from '@/schemas/productCreate';
import { productListSchema, type Product } from '@/schemas/products';
import { useProductBatchStore } from '@/stores/productBatchStore';
import { buildProductCreatePayload } from '@/utils/productCreate';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

// Ürün adı ve görseli sık değişmez
const PRODUCTS_STALE_MS = 5 * 60_000;
// Tüm katalog büyük bir yanıt; uygulama açılışında ve aşağı çekince gelir, süre yalnızca
// uygulama arka planda donup kaldığında eski stoğun görünmesini engeller.
const PRODUCT_LIST_CACHE_MS = 60 * 60_000;

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

export function useProducts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: ({ signal }) => getProducts(signal),
    staleTime: PRODUCT_LIST_CACHE_MS,
    gcTime: PRODUCT_LIST_CACHE_MS,
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

  return useQuery({
    queryKey: productKeys.byIds(sortedIds),
    queryFn: ({ signal }) => getProductsByIds(sortedIds, signal),
    staleTime: PRODUCTS_STALE_MS,
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
