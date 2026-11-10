import type { OrderCreateForm } from '@/features/orders/schemas/orderCreate';
import {
  orderCustomStatusListSchema,
  orderListSchema,
  orderPaymentTypeListSchema,
  type Order,
} from '@/features/orders/schemas/orders';
import { buildOrderCreatePayload, getMailDomain } from '@/features/orders/utils/orderCreate';
import type { OrderSearch } from '@/features/orders/utils/orderList';
import {
  filterOrdersByRange,
  getBaseOrderRange,
  isRangeWithin,
} from '@/features/orders/utils/orderPeriod';
import { dedupeOrders } from '@/features/orders/utils/orderStats';
import type { DayRange } from '@/features/period/periodWindow';
import { productKeys } from '@/features/products/api/products';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useFocusSubscribed } from '@/hooks/useFocusSubscribed';
import { apiClient } from '@/lib/apiClient';
import { CACHE } from '@/lib/cachePolicy';
import { env } from '@/lib/env';
import { addDays } from '@/utils/dateKey';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { z } from 'zod';

export const orderKeys = {
  all: ['orders'] as const,
  list: (range: DayRange) => [...orderKeys.all, 'list', range] as const,
  search: (search: OrderSearch) => [...orderKeys.all, 'search', search] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
  paymentTypes: () => [...orderKeys.all, 'paymentTypes'] as const,
  customStatuses: () => [...orderKeys.all, 'customStatuses'] as const,
};

export async function getOrders(range: DayRange, signal?: AbortSignal) {
  const { data } = await apiClient.post('order/get', {
    schema: orderListSchema,
    // API'de bitiş tarihi dahil değildir; endDay'in siparişleri için ertesi gün verilir.
    arguments: { startTime: range.startDay, endTime: addDays(range.endDay, 1) },
    signal,
  });

  return dedupeOrders(data);
}

// Numara ve telefon tam eşleşir, tarih gerektirmez; eski siparişler böyle bulunur.
export async function searchOrders(search: OrderSearch, signal?: AbortSignal) {
  const { data } = await apiClient.post('order/get', {
    schema: orderListSchema,
    arguments: search.kind === 'id' ? { id: search.value } : { deliveryPhone: search.value },
    signal,
  });

  return dedupeOrders(data);
}

// Numarayla istek tarih istemez; raporlardan açılan eski siparişler de gelir.
export async function getOrder(id: number, signal?: AbortSignal) {
  const [order] = await searchOrders({ kind: 'id', value: String(id) }, signal);

  return order ?? null;
}

export async function getOrderPaymentTypes(signal?: AbortSignal) {
  const { data } = await apiClient.post('order/getPaymentTypes', {
    schema: orderPaymentTypeListSchema,
    signal,
  });

  return data;
}

export async function getOrderCustomStatuses(signal?: AbortSignal) {
  const { data } = await apiClient.post('order/getCustomSituations', {
    schema: orderCustomStatusListSchema,
    signal,
  });

  return data;
}

// Yanıtın biçimi belgelenmemiş; başarı zarfın status alanından anlaşılır, içerik kullanılmaz.
export async function createOrder(values: OrderCreateForm) {
  return apiClient.post('order/add', {
    schema: z.unknown(),
    arguments: buildOrderCreatePayload(values, {
      now: new Date(),
      mailDomain: getMailDomain(env.apiUrl),
    }),
  });
}

// Yalnızca değişen alanlar gönderilir. Durum değişikliği stoğa dokunmaz: API stoğu güncellemiyor,
// elle güncellemek de panelden geri almayla çakışıyor (stockReloaded API'den yazılamıyor).
export async function updateOrder(id: number, update: Record<string, unknown>) {
  return apiClient.post('order/update', {
    schema: z.unknown(),
    arguments: { selectArguments: { id }, updateArguments: update },
  });
}

// Son 7 güne giren dönemler aynı veriden süzülür: istek ve iskelet olmadan anında görünür.
// Daha geniş veya eski dönemler kendi isteğini atar.
// Ekran odakta değilken sorgu dinlenmez (bkz. useFocusSubscribed): arka plandaki sekmeler
// istek atmaz, ekran odağa gelince veri eskidiyse arkada yenilenir. `refetchInterval`
// verilirse ekran görünürken bu aralıkla da yenilenir (bkz. ORDER_AUTO_REFRESH_MS).
export function useOrders(
  range: DayRange,
  options?: { enabled?: boolean; refetchInterval?: number },
) {
  const { now } = useCurrentTime();
  const queryClient = useQueryClient();
  const { startDay, endDay } = range;
  const baseRange = getBaseOrderRange(now);
  const isInBase = isRangeWithin(range, baseRange);
  const sourceStartDay = isInBase ? baseRange.startDay : startDay;
  const sourceEndDay = isInBase ? baseRange.endDay : endDay;
  const sourceRange = { startDay: sourceStartDay, endDay: sourceEndDay };
  const queryKey = orderKeys.list(sourceRange);
  const subscribed = useFocusSubscribed(queryKey);

  const selectPeriod = useCallback(
    (orders: Order[]) => filterOrdersByRange(orders, { startDay, endDay }),
    [startDay, endDay],
  );

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getOrders(sourceRange, signal),
    ...CACHE.orders,
    subscribed,
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    select: isInBase ? selectPeriod : undefined,
  });

  // Dönem değişince eskimiş veri arkada sessizce yenilenir; süren istek kesilmez
  useEffect(() => {
    void queryClient.refetchQueries(
      {
        queryKey: orderKeys.list({ startDay: sourceStartDay, endDay: sourceEndDay }),
        exact: true,
        stale: true,
        type: 'active',
        fetchStatus: 'idle',
      },
      { cancelRefetch: false },
    );
  }, [queryClient, startDay, endDay, sourceStartDay, sourceEndDay]);

  return query;
}

export function useOrderSearch(search: OrderSearch | null) {
  const queryKey = search ? orderKeys.search(search) : [...orderKeys.all, 'search'];
  const subscribed = useFocusSubscribed(queryKey);

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => (search ? searchOrders(search, signal) : []),
    ...CACHE.orderSearch,
    subscribed,
    enabled: search !== null,
  });
}

// Listeden gelinen sipariş önbellekte zaten var; sayfa onunla beklemeden açılır,
// güncel hali arkada istenir.
// Yalnızca sipariş listeleri aranır; ödeme türleri de aynı anahtar altındadır ve id'leri çakışır.
const ORDER_LIST_SCOPES = ['list', 'search'] as const;

function findCachedOrder(queryClient: QueryClient, id: number): Order | undefined {
  for (const scope of ORDER_LIST_SCOPES) {
    const cached = queryClient.getQueriesData<Order[]>({ queryKey: [...orderKeys.all, scope] });

    for (const [, orders] of cached) {
      const found = orders?.find((order) => order.id === id);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

export function useOrder(id: number) {
  const queryClient = useQueryClient();
  const queryKey = orderKeys.detail(id);
  const subscribed = useFocusSubscribed(queryKey);

  return useQuery<Order | null>({
    queryKey,
    queryFn: ({ signal }) => getOrder(id, signal),
    ...CACHE.orderDetail,
    subscribed,
    placeholderData: () => findCachedOrder(queryClient, id),
    enabled: Number.isFinite(id),
  });
}

export function useOrderPaymentTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.paymentTypes(),
    queryFn: ({ signal }) => getOrderPaymentTypes(signal),
    ...CACHE.lookups,
    enabled: options?.enabled,
  });
}

export function useOrderCustomStatuses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.customStatuses(),
    queryFn: ({ signal }) => getOrderCustomStatuses(signal),
    ...CACHE.lookups,
    enabled: options?.enabled,
  });
}

// Yeni sipariş listeye ve stoğa yansısın diye ikisi de yenilenir (order/add stoğu düşer).
// Odakta olmayan sekmelerin verisi hemen değil, sekme açılınca istenir.
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

type UpdateOrderVariables = {
  id: number;
  update: Record<string, unknown>;
};

// Detay yeniden gelene kadar beklenir ki düzenlemeden çıkınca eski bilgi görünmesin;
// listeler arkada yenilenir.
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, update }: UpdateOrderVariables) => updateOrder(id, update),
    onSuccess: async (_data, { id }) => {
      await queryClient.refetchQueries({ queryKey: orderKeys.detail(id), exact: true });
      void queryClient.invalidateQueries({
        queryKey: orderKeys.all,
        predicate: (query) => ORDER_LIST_SCOPES.some((scope) => scope === query.queryKey[1]),
      });
    },
  });
}

// Aşağı çekip yenileme: ekranda kullanılan tüm sipariş sorguları yeniden istenir.
export function useRefreshOrders() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: orderKeys.all });
}
