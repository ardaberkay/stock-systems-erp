import { useOrders } from '@/features/orders/api/orders';
import { mergeOrders } from '@/features/orders/utils/orderList';
import { getProductChartPoints, getRevenueOrders } from '@/features/orders/utils/orderStats';
import { resolvePeriodWindow } from '@/features/period/periodWindow';
import { useProductSalesStore } from '@/features/products/stores/productSalesStore';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useMemo } from 'react';

// Ürün detayındaki satış grafiğinin verisi. API siparişleri ürüne göre süzmüyor; seçili dönemin
// siparişleri çekilir, ürünün satırları burada ayrılır. Son 7 gün anasayfa ve siparişlerle aynı
// veridir, ek istek atılmaz.
export function useProductSales(productId: number) {
  const selection = useProductSalesStore((state) => state.selection);
  const { now } = useCurrentTime();
  const window = useMemo(() => resolvePeriodWindow(selection, now), [selection, now]);
  const { data, error, refetch } = useOrders(window.range);

  const { points, sold, revenue } = useMemo(() => {
    // Ciro raporlarla aynı kuralla: iptal ve iadeler sayılmaz
    const revenueOrders = getRevenueOrders(mergeOrders(data ?? []));
    const chartPoints = getProductChartPoints(revenueOrders, productId, window);

    return {
      points: chartPoints,
      sold: chartPoints.reduce((sum, point) => sum + (point.sold ?? 0), 0),
      revenue: chartPoints.reduce((sum, point) => sum + (point.revenue ?? 0), 0),
    };
  }, [data, productId, window]);

  return {
    selection,
    window,
    points,
    sold,
    revenue,
    hasData: data !== undefined,
    error,
    refetch,
  };
}
