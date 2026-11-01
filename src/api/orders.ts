import { apiClient } from '@/lib/apiClient';
import {
  orderCustomStatusListSchema,
  orderListSchema,
  orderPaymentTypeListSchema,
} from '@/schemas/orders';
import { addDays } from '@/utils/dateKey';
import type { OrderSearch } from '@/utils/orderList';
import { getPreviousOrderPage } from '@/utils/orderPeriod';
import { dedupeOrders } from '@/utils/orderStats';
import type { DayRange } from '@/utils/periodWindow';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

// Rate limit ve veri yükü için seyrek yenilenir; güncel rakam aşağı çekerek alınır.
const ORDERS_STALE_MS = 5 * 60_000;
// Ödeme türleri ve özel durumlar sık değişmez
const ORDER_OPTIONS_CACHE_MS = 60 * 60_000;

export const orderKeys = {
  all: ['orders'] as const,
  list: (range: DayRange) => [...orderKeys.all, 'list', range] as const,
  pages: (range: DayRange) => [...orderKeys.all, 'pages', range] as const,
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

export function useOrders(range: DayRange, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.list(range),
    queryFn: ({ signal }) => getOrders(range, signal),
    staleTime: ORDERS_STALE_MS,
    enabled: options?.enabled,
  });
}

// API sayfalama yapmaz; ilk sayfa seçili dönem, sonrakiler onun öncesindeki 7 günlük dilimlerdir.
export function useOrderPages(range: DayRange) {
  return useInfiniteQuery({
    queryKey: orderKeys.pages(range),
    queryFn: ({ pageParam, signal }) => getOrders(pageParam, signal),
    initialPageParam: range,
    getNextPageParam: (_lastPage, _pages, lastPageParam) => getPreviousOrderPage(lastPageParam),
    staleTime: ORDERS_STALE_MS,
  });
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
