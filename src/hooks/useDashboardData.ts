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
import { useMemo, useState } from 'react';

const BEST_SELLER_LIMIT = 10;

// İstekler rate limit yüzünden sırayla gider: seçili dönem, ürün bilgileri, önceki dönem.
// Ürünler öne alındı; ekranda kart, rozetten çok daha fazla yer kaplıyor.
// Daha önce açılan dönemler cache'ten anında gösterilir.
export function useDashboardData() {
  const selection = useDashboardFilterStore((state) => state.selection);
  const { now, refreshNow } = useCurrentTime();
  const window = useMemo(() => resolvePeriodWindow(selection, now), [selection, now]);

  const currentQuery = useOrders(window.range);

  const revenueOrders = useMemo(
    () => (currentQuery.data ? getRevenueOrders(currentQuery.data) : null),
    [currentQuery.data],
  );
  const bestSellers = useMemo(
    () => (revenueOrders ? getBestSellers(revenueOrders, window, BEST_SELLER_LIMIT) : []),
    [revenueOrders, window],
  );
  const productIds = bestSellers.map((item) => item.productId);
  const productsQuery = useProductsByIds(productIds);

  const previousQuery = useOrders(window.previousRange, {
    // Çok satan yoksa ürün isteği hiç gitmez; önceki dönem onu beklememeli
    enabled: currentQuery.isSuccess && (productIds.length === 0 || productsQuery.isFetched),
  });

  const stats = useMemo(() => {
    if (!revenueOrders) {
      return null;
    }

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
      bestSellers,
    };
  }, [revenueOrders, bestSellers, previousQuery.data, window]);

  const productsById = new Map(productsQuery.data?.map((product) => [product.id, product]));

  const refreshOrders = useRefreshOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    refreshNow();
    await refreshOrders();
    setIsRefreshing(false);
  };

  return {
    window,
    stats,
    productsById,
    isLoading: currentQuery.isPending,
    // Kartlar ürün bilgisi gelene kadar tümüyle iskelet kalır, yarım dolu görünmez
    isProductsLoading: productsQuery.isPending && productIds.length > 0,
    error: currentQuery.error,
    isRefreshing,
    refresh,
  };
}
