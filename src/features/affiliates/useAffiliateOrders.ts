import { useAffiliateFilterStore } from '@/features/affiliates/affiliateFilterStore';
import { useOrders } from '@/features/orders/api/orders';
import { getOrderTotals, getRevenueOrders } from '@/features/orders/utils/orderStats';
import { mergeOrders } from '@/features/orders/utils/orderList';
import type { PeriodSelection } from '@/features/period/constants';
import { resolvePeriodWindow } from '@/features/period/periodWindow';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useMemo } from 'react';

// API siparişleri ortağa göre süzmüyor (affiliateAccountId yok sayılıyor) ve en fazla 30 gün
// veriyor; seçili dönemin siparişleri çekilir, ortağınkiler burada ayrılır. Son 7 gün
// anasayfa ve siparişlerle aynı veridir, ek istek atılmaz.
// fixedSelection verilirse store'daki seçim yerine o dönem kullanılır (detaydaki satır hep
// son 7 günü gösterir).
export function useAffiliateOrders(affiliateId: number, fixedSelection?: PeriodSelection) {
  const storeSelection = useAffiliateFilterStore((state) => state.selection);
  const selection = fixedSelection ?? storeSelection;
  const { now } = useCurrentTime();
  const window = useMemo(() => resolvePeriodWindow(selection, now), [selection, now]);
  const { data, isPending, error, refetch } = useOrders(window.range);

  const result = useMemo(() => {
    const orders = mergeOrders(
      (data ?? []).filter((order) => order.affiliateAccountId === affiliateId),
    );
    // Ciro raporlarla aynı kuralla: iptal ve iadeler sayılmaz
    const revenueOrders = getRevenueOrders(orders);
    const { revenue } = getOrderTotals(revenueOrders);

    return { orders, revenueOrders, revenue };
  }, [data, affiliateId]);

  return {
    selection,
    window,
    orders: result.orders,
    // Grafik ve çok satanlar bunlardan hesaplanır
    revenueOrders: result.revenueOrders,
    revenue: result.revenue,
    hasData: data !== undefined,
    isPending,
    error,
    refetch,
  };
}
