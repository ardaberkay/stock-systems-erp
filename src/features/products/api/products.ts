import {
  batchRequestCreatedSchema,
  batchRequestListSchema,
} from '@/features/products/schemas/batchRequest';
import type { ProductCreateForm } from '@/features/products/schemas/productCreate';
import { productListSchema, type Product } from '@/features/products/schemas/products';
import { useProductBatchStore } from '@/features/products/stores/productBatchStore';
import { buildProductCreatePayload } from '@/features/products/utils/productCreate';
import { catalogKeys } from '@/features/products/api/catalog';
import type { CatalogItem, Category } from '@/features/products/schemas/catalog';
import type { ProductEditForm } from '@/features/products/schemas/productEdit';
import {
  applyProductEdit,
  getPlanRequestCount,
  type AppliedEdit,
  type NewVariantPayload,
  type ProductEditPlan,
} from '@/features/products/utils/productEdit';
import { useFocusSubscribed } from '@/hooks/useFocusSubscribed';
import { apiClient } from '@/lib/apiClient';
import { isApiError, type ApiErrorKind } from '@/lib/apiError';
import { CACHE } from '@/lib/cachePolicy';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  byIds: (ids: number[]) => [...productKeys.all, 'byIds', ids] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
  batch: (batchRequestId: string) => [...productKeys.all, 'batch', batchRequestId] as const,
};

// Ürün değişince yenilenen listeler: katalog ve sipariş detayındaki ürünler
const PRODUCT_LIST_SCOPES = ['list', 'byIds'] as const;

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

export async function getProduct(id: number, signal?: AbortSignal) {
  const [product] = await getProductsByIds([id], signal);

  return product ?? null;
}

// Detay sayfası. Katalog bellekteyse ürün oradan anında gelir, eskidiyse arkada yenilenir.
export function useProduct(id: number) {
  const queryClient = useQueryClient();
  const queryKey = productKeys.detail(id);
  const subscribed = useFocusSubscribed(queryKey);

  return useQuery<Product | null>({
    queryKey,
    queryFn: ({ signal }) => getProduct(id, signal),
    ...CACHE.products,
    subscribed,
    enabled: Number.isFinite(id),
    initialData: () => pickFromCatalog(queryClient, [id])?.[0],
    initialDataUpdatedAt: () => queryClient.getQueryState(productKeys.list())?.dataUpdatedAt,
  });
}

// Ürün bilgisi, varyant ve stok servisleri anında çalışır (test 10.11.2026); product/add gibi
// sıraya girmez. Hepsinin yanıtı yalnızca etkilenen kayıt sayısıdır, içeriği kullanılmaz.
function updateProductFields(id: number, update: Record<string, unknown>) {
  return apiClient.post('product/update', {
    schema: z.unknown(),
    arguments: { selectArguments: { ids: [id] }, updateArguments: update },
  });
}

function updateVariant(id: number, update: Record<string, unknown>) {
  return apiClient.post('product/updateVariant', {
    schema: z.unknown(),
    arguments: { selectArguments: { ids: [id] }, updateArguments: update },
  });
}

// Adet yazılmaz, fark eklenir veya düşülür
function changeVariantStock(id: number, delta: number) {
  return delta > 0
    ? apiClient.post('product/increaseVariantStock', {
        schema: z.unknown(),
        arguments: { selectArguments: { ids: [id] }, updateArguments: { num2Increase: delta } },
      })
    : apiClient.post('product/decreaseVariantStock', {
        schema: z.unknown(),
        arguments: { selectArguments: { ids: [id] }, updateArguments: { num2Decrease: -delta } },
      });
}

// Panel varyantı arşivler, bu servis kalıcı siler (test 10.11.2026)
function deleteVariant(id: number) {
  return apiClient.post('product/deleteVariant', {
    schema: z.unknown(),
    arguments: { id },
  });
}

// Yanıt yeni varyantın id'sidir. Boş barkod sunucuda boş kalır; product/add'deki gibi üretilmez.
function addVariant(productId: number, variant: NewVariantPayload) {
  return apiClient.post('product/addVariant', {
    schema: z.coerce.number(),
    arguments: { productId, ...variant },
  });
}

export type ProductSaveResult = {
  total: number;
  saved: number;
  applied: AppliedEdit;
  // İlk hata; hiç hata yoksa null
  error: unknown;
};

// Bu hatalar her isteği etkiler (bağlantı, süre, hız sınırı, oturum); sonrakiler denenmez
const STOP_ERROR_KINDS: readonly ApiErrorKind[] = ['config', 'network', 'timeout', 'rateLimit', 'unauthorized'];

function shouldStop(error: unknown): boolean {
  return !isApiError(error) || STOP_ERROR_KINDS.includes(error.kind);
}

// İstekler sırayla gider (apiClient zaten tek sıra). Önce silinenler: aynı adı alacak bir
// varyant varsa çakışmasın. Sunucu tek bir adımı reddederse diğerleri yine denenir; hangilerinin
// uygulandığı döner, ekran formun başlangıcını buna göre ilerletir (bkz. advanceEditBaseline).
export async function saveProductEdit(
  productId: number,
  plan: ProductEditPlan,
): Promise<ProductSaveResult> {
  const applied: AppliedEdit = { product: false, deletedIds: [], updatedIds: [], stockIds: [], added: [] };
  const productUpdate = plan.product;
  const steps: (() => Promise<void>)[] = [
    ...(productUpdate
      ? [
          async () => {
            await updateProductFields(productId, productUpdate);
            applied.product = true;
          },
        ]
      : []),
    ...plan.deletedVariantIds.map((id) => async () => {
      await deleteVariant(id);
      applied.deletedIds.push(id);
    }),
    ...plan.variantUpdates.map(({ id, update }) => async () => {
      await updateVariant(id, update);
      applied.updatedIds.push(id);
    }),
    ...plan.stockChanges.map(({ id, delta }) => async () => {
      await changeVariantStock(id, delta);
      applied.stockIds.push(id);
    }),
    ...plan.newVariants.map(({ key, payload }) => async () => {
      const id = await addVariant(productId, payload);
      applied.added.push({ key, id });
    }),
  ];
  let saved = 0;
  let firstError: unknown = null;

  for (const step of steps) {
    try {
      await step();
      saved += 1;
    } catch (error) {
      firstError ??= error;
      if (shouldStop(error)) {
        break;
      }
    }
  }

  return { total: getPlanRequestCount(plan), saved, applied, error: firstError };
}

type SaveProductVariables = {
  plan: ProductEditPlan;
  // Düzenleme açıldığındaki ürün ve kaydedilen değerler; ekran beklemeden güncellenir
  product: Product;
  values: ProductEditForm;
};

// Hepsi kaydedildiyse detay ve katalog girilen değerlerle hemen güncellenir. Sonuç ne olursa
// olsun ürün arkada yeniden okunur; beklenmez, kayıt biter bitmez ekran sonucu işler.
export function useSaveProductEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ product, plan }: SaveProductVariables) => saveProductEdit(product.id, plan),
    onSuccess: (result, { product, values }) => {
      if (result.error !== null) {
        return;
      }
      const next = applyProductEdit(product, values, {
        brands: queryClient.getQueryData<CatalogItem[]>(catalogKeys.brands()),
        types: queryClient.getQueryData<CatalogItem[]>(catalogKeys.types()),
        categories: queryClient.getQueryData<Category[]>(catalogKeys.categories()),
      });

      queryClient.setQueryData(productKeys.detail(product.id), next);
      queryClient.setQueryData<Product[]>(productKeys.list(), (catalog) =>
        catalog?.map((item) => (item.id === product.id ? next : item)),
      );
    },
    onSettled: (_result, _error, { product }) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id), exact: true });
      void queryClient.invalidateQueries({
        queryKey: productKeys.all,
        predicate: (query) => PRODUCT_LIST_SCOPES.some((scope) => scope === query.queryKey[1]),
      });
    },
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
