import { useAffiliateFilterStore } from '@/features/affiliates/affiliateFilterStore';
import { useOrders } from '@/features/orders/api/orders';
import { getOrderTotals, getRevenueOrders } from '@/features/orders/utils/orderStats';
import { mergeOrders } from '@/features/orders/utils/orderList';
import { resolvePeriodWindow } from '@/features/period/periodWindow';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useMemo } from 'react';

// API siparişleri ortağa göre süzmüyor (affiliateAccountId yok sayılıyor) ve en fazla 30 gün
// veriyor; seçili dönemin siparişleri çekilir, ortağınkiler burada ayrılır. Son 7 gün
// anasayfa ve siparişlerle aynı veridir, ek istek atılmaz.
export function useAffiliateOrders(affiliateId: number) {
  const selection = useAffiliateFilterStore((state) => state.selection);
  const { now } = useCurrentTime();
  const window = useMemo(() => resolvePeriodWindow(selection, now), [selection, now]);
  const { data, isPending, error, refetch } = useOrders(window.range);

  const result = useMemo(() => {
    const orders = mergeOrders(
      (data ?? []).filter((order) => order.affiliateAccountId === affiliateId),
    );
    // Ciro raporlarla aynı kuralla: iptal ve iadeler sayılmaz
    const { revenue } = getOrderTotals(getRevenueOrders(orders));

    return { orders, revenue };
  }, [data, affiliateId]);

  return {
    selection,
    orders: result.orders,
    revenue: result.revenue,
    hasData: data !== undefined,
    isPending,
    error,
    refetch,
  };
}
