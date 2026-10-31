import { apiClient } from '@/lib/apiClient';
import { orderListSchema } from '@/schemas/orders';
import { addDays } from '@/utils/dateKey';
import { dedupeOrders } from '@/utils/orderStats';
import type { DayRange } from '@/utils/periodWindow';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Rate limit ve veri yükü için seyrek yenilenir; güncel rakam aşağı çekerek alınır.
const ORDERS_STALE_MS = 5 * 60_000;

export const orderKeys = {
  all: ['orders'] as const,
  list: (range: DayRange) => [...orderKeys.all, 'list', range] as const,
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

export function useOrders(range: DayRange, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.list(range),
    queryFn: ({ signal }) => getOrders(range, signal),
    staleTime: ORDERS_STALE_MS,
    enabled: options?.enabled,
  });
}

// Aşağı çekip yenileme: ekranda kullanılan tüm sipariş sorguları yeniden istenir.
export function useRefreshOrders() {
  const queryClient = useQueryClient();

  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
    [queryClient],
  );
}
