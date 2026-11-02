import { useOrders, useRefreshOrders } from '@/api/orders';
import { useProductsByIds } from '@/api/products';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import { getBaseOrderRange, isRangeWithin } from '@/utils/orderPeriod';
import {
  filterUntil,
  getBestSellers,
  getChartPoints,
  getOrderProductIds,
  getOrderTotals,
  getRevenueChange,
  getRevenueOrders,
} from '@/utils/orderStats';
import { resolvePeriodWindow } from '@/utils/periodWindow';
import { useMemo, useState } from 'react';

const BEST_SELLER_LIMIT = 10;

// İstekler rate limit yüzünden sırayla gider: seçili dönem, ürün bilgileri, önceki dönem.
// Ürünler öne alındı; ekranda kart, rozetten çok daha fazla yer kaplıyor.
// Son 7 güne giren dönemler aynı sipariş ve ürün verisini kullanır, dönem değişince iskelet çıkmaz.
export function useDashboardData() {
  const selection = useDashboardFilterStore((state) => state.selection);
  const { now, refreshNow } = useCurrentTime();
  const window = useMemo(() => resolvePeriodWindow(selection, now), [selection, now]);

  const currentQuery = useOrders(window.range);
  const baseRange = useMemo(() => getBaseOrderRange(now), [now]);
  const baseQuery = useOrders(baseRange);
  const isInBase = isRangeWithin(window.range, baseRange);

  const revenueOrders = useMemo(
    () => (currentQuery.data ? getRevenueOrders(currentQuery.data) : null),
    [currentQuery.data],
  );
  const bestSellers = useMemo(
    () => (revenueOrders ? getBestSellers(revenueOrders, window, BEST_SELLER_LIMIT) : []),
    [revenueOrders, window],
  );
  // Yalnızca ilk 10 istenirse her dönemin listesi farklı olduğu için yeni istek gider
  const productIds = useMemo(
    () =>
      isInBase
        ? getOrderProductIds(baseQuery.data ?? [])
        : bestSellers.map((item) => item.productId),
    [isInBase, baseQuery.data, bestSellers],
  );
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
  // Eski dönemin ürünleri bu listeyi karşılamıyorsa kartlar bilgisiz görünmesin
  const isProductsLoading =
    productIds.length > 0 &&
    (productsQuery.isPending ||
      (productsQuery.isPlaceholderData &&
        bestSellers.some((item) => !productsById.has(item.productId))));

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
    // Ciro, grafik ve kartlar birlikte açılır; sayfa parça parça dolmaz
    isLoading: currentQuery.isPending || isProductsLoading,
    error: currentQuery.error,
    isRefreshing,
    refresh,
  };
}
