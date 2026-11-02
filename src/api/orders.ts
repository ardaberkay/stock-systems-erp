import { apiClient } from '@/lib/apiClient';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import {
  orderCustomStatusListSchema,
  orderListSchema,
  orderPaymentTypeListSchema,
  type Order,
} from '@/schemas/orders';
import { addDays } from '@/utils/dateKey';
import type { OrderSearch } from '@/utils/orderList';
import { filterOrdersByRange, getBaseOrderRange, isRangeWithin } from '@/utils/orderPeriod';
import { dedupeOrders } from '@/utils/orderStats';
import type { DayRange } from '@/utils/periodWindow';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

// Rate limit ve veri yükü için seyrek yenilenir; güncel rakam aşağı çekerek alınır.
const ORDERS_STALE_MS = 5 * 60_000;
// Ödeme türleri ve özel durumlar sık değişmez
const ORDER_OPTIONS_CACHE_MS = 60 * 60_000;

export const orderKeys = {
  all: ['orders'] as const,
  list: (range: DayRange) => [...orderKeys.all, 'list', range] as const,
  search: (search: OrderSearch) => [...orderKeys.all, 'search', search] as const,
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

// Son 7 güne giren dönemler aynı veriden süzülür: istek ve iskelet olmadan anında görünür.
// Daha geniş veya eski dönemler kendi isteğini atar.
export function useOrders(range: DayRange, options?: { enabled?: boolean }) {
  const { now } = useCurrentTime();
  const queryClient = useQueryClient();
  const { startDay, endDay } = range;
  const baseRange = getBaseOrderRange(now);
  const isInBase = isRangeWithin(range, baseRange);
  const sourceStartDay = isInBase ? baseRange.startDay : startDay;
  const sourceEndDay = isInBase ? baseRange.endDay : endDay;
  const sourceRange = { startDay: sourceStartDay, endDay: sourceEndDay };

  const selectPeriod = useCallback(
    (orders: Order[]) => filterOrdersByRange(orders, { startDay, endDay }),
    [startDay, endDay],
  );

  const query = useQuery({
    queryKey: orderKeys.list(sourceRange),
    queryFn: ({ signal }) => getOrders(sourceRange, signal),
    staleTime: ORDERS_STALE_MS,
    enabled: options?.enabled,
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
  return useQuery({
    queryKey: search ? orderKeys.search(search) : [...orderKeys.all, 'search'],
    queryFn: ({ signal }) => (search ? searchOrders(search, signal) : []),
    staleTime: ORDERS_STALE_MS,
    enabled: search !== null,
  });
}

export function useOrderPaymentTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.paymentTypes(),
    queryFn: ({ signal }) => getOrderPaymentTypes(signal),
    staleTime: ORDER_OPTIONS_CACHE_MS,
    gcTime: ORDER_OPTIONS_CACHE_MS,
    enabled: options?.enabled,
  });
}

export function useOrderCustomStatuses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.customStatuses(),
    queryFn: ({ signal }) => getOrderCustomStatuses(signal),
    staleTime: ORDER_OPTIONS_CACHE_MS,
    gcTime: ORDER_OPTIONS_CACHE_MS,
    enabled: options?.enabled,
  });
}

// Aşağı çekip yenileme: ekranda kullanılan tüm sipariş sorguları yeniden istenir.
export function useRefreshOrders() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: orderKeys.all });
}
