import { useOrders, useRefreshOrders } from '@/api/orders';
import { useProductsByIds } from '@/api/products';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import {
  filterUntil,
  getBestSellers,
  getChartPoints,
  getOrderTotals,
  getRevenueChange,
  getRevenueOrders,
} from '@/utils/orderStats';
import { resolvePeriodWindow } from '@/utils/periodWindow';
import { useCallback, useMemo, useState } from 'react';

const BEST_SELLER_LIMIT = 10;

// Yalnızca seçili dönem istenir, önceki dönem ve ürün bilgileri ardından gelir.
// Daha önce açılan dönemler cache'ten anında gösterilir.
export function useDashboardData() {
  const selection = useDashboardFilterStore((state) => state.selection);
  const { now, refreshNow } = useCurrentTime();
  const window = useMemo(() => resolvePeriodWindow(selection, now), [selection, now]);

  const currentQuery = useOrders(window.range);
  const previousQuery = useOrders(window.previousRange, { enabled: currentQuery.isSuccess });

  const stats = useMemo(() => {
    if (!currentQuery.data) {
      return null;
    }

    const revenueOrders = getRevenueOrders(currentQuery.data);
    // Çizgi önceki dönemin tamamını gösterir, rozet ise yalnızca aynı saate kadar kıyaslar.
    const previousRevenueOrders = previousQuery.data ? getRevenueOrders(previousQuery.data) : null;
    const totals = getOrderTotals(revenueOrders);

    return {
      totals,
      change: previousRevenueOrders
        ? getRevenueChange(
            totals.revenue,
            getOrderTotals(filterUntil(previousRevenueOrders, window.previousCutoff)).revenue,
          )
        : null,
      chartPoints: getChartPoints(revenueOrders, previousRevenueOrders, window),
      bestSellers: getBestSellers(revenueOrders, window, BEST_SELLER_LIMIT),
    };
  }, [currentQuery.data, previousQuery.data, window]);

  const productIds = useMemo(
    () => stats?.bestSellers.map((item) => item.productId) ?? [],
    [stats],
  );
  const productsQuery = useProductsByIds(productIds, { enabled: previousQuery.isFetched });

  const productsById = useMemo(
    () => new Map(productsQuery.data?.map((product) => [product.id, product])),
    [productsQuery.data],
  );

  const refreshOrders = useRefreshOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    refreshNow();
    await refreshOrders();
    setIsRefreshing(false);
  }, [refreshNow, refreshOrders]);

  return {
    window,
    stats,
    productsById,
    isLoading: currentQuery.isPending,
    // Ürün isteği sırada beklerken de kartlarda ürün iskeleti görünür
    isProductsLoading: productsQuery.isPending && productIds.length > 0,
    error: currentQuery.error,
    isRefreshing,
    refresh,
  };
}
