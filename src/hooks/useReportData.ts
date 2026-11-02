import { useOrderPaymentTypes, useOrders, useRefreshOrders } from '@/api/orders';
import { useProducts } from '@/api/products';
import type { PeriodSelection } from '@/constants/periods';
import { REPORT_TOP_PRODUCT_LIMIT } from '@/constants/reports';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { getBestSellers, getRevenueOrders } from '@/utils/orderStats';
import { resolvePeriodWindow } from '@/utils/periodWindow';
import {
  getBusyGrid,
  getBusySlots,
  getCityCounts,
  getCustomerRanks,
  getPaymentShares,
  getProfitStats,
  getReturnStats,
  getStatusCounts,
  getStockStats,
  getUnsoldProducts,
  getWeekdayCounts,
} from '@/utils/reportStats';
import { useMemo, useState } from 'react';

export type ReportStats = NonNullable<ReturnType<typeof useReportData>['stats']>;

// İstekler rate limit yüzünden sırayla gider: önce siparişler, sonra ürünler.
// Son 7 günlük sipariş anasayfayla aynı veridir, ek istek atılmaz.
export function useReportData(selection: PeriodSelection) {
  const { now, refreshNow } = useCurrentTime();
  const window = useMemo(() => resolvePeriodWindow(selection, now), [selection, now]);
  const ordersQuery = useOrders(window.range);
  const productsQuery = useProducts({ enabled: ordersQuery.isSuccess });
  const paymentTypesQuery = useOrderPaymentTypes({ enabled: productsQuery.isSuccess });
  const paymentTypes = paymentTypesQuery.data;

  const orders = ordersQuery.data;
  const products = productsQuery.data;

  const stats = useMemo(() => {
    if (!orders || !products) {
      return null;
    }

    const revenueOrders = getRevenueOrders(orders);
    const busyGrid = getBusyGrid(revenueOrders);

    return {
      orderCount: orders.length,
      revenueOrderCount: revenueOrders.length,
      statusCounts: getStatusCounts(orders),
      returns: getReturnStats(orders, window.range),
      topProducts: getBestSellers(revenueOrders, window, REPORT_TOP_PRODUCT_LIMIT),
      topProductsByRevenue: getBestSellers(
        revenueOrders,
        window,
        REPORT_TOP_PRODUCT_LIMIT,
        'revenue',
      ),
      customers: getCustomerRanks(revenueOrders),
      paymentShares: getPaymentShares(revenueOrders),
      cityCounts: getCityCounts(revenueOrders),
      weekdayCounts: getWeekdayCounts(revenueOrders),
      busyGrid,
      busySlots: getBusySlots(busyGrid),
      profit: getProfitStats(revenueOrders, products),
      stock: getStockStats(products),
      unsold: getUnsoldProducts(revenueOrders, products),
    };
  }, [orders, products, window]);

  const productsById = useMemo(
    () => new Map(products?.map((product) => [product.id, product])),
    [products],
  );
  const paymentNames = useMemo(
    () => new Map(paymentTypes?.map((type) => [type.id, type.name])),
    [paymentTypes],
  );

  const refreshOrders = useRefreshOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    refreshNow();
    await refreshOrders();
    await productsQuery.refetch();
    setIsRefreshing(false);
  };

  return {
    stats,
    productsById,
    paymentNames,
    isPaymentNamesLoading: paymentTypesQuery.isPending,
    isLoading: ordersQuery.isPending || (ordersQuery.isSuccess && productsQuery.isPending),
    error: ordersQuery.error ?? productsQuery.error,
    isRefreshing,
    refresh,
  };
}
