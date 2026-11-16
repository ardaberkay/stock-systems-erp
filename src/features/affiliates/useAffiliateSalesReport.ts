import { useAffiliateOrders } from '@/features/affiliates/useAffiliateOrders';
import { useOrders } from '@/features/orders/api/orders';
import { getBaseOrderRange, isRangeWithin } from '@/features/orders/utils/orderPeriod';
import {
  getBestSellers,
  getChartPoints,
  getOrderProductIds,
} from '@/features/orders/utils/orderStats';
import { useProductsByIds } from '@/features/products/api/products';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useMemo } from 'react';

// Ortağın sattığı ürünler genelde az; daha uzun liste ekranı kalabalık eder
const TOP_PRODUCT_LIMIT = 3;

// Ortak satış raporunun verisi: siparişler, günlük/saatlik grafik noktaları ve en çok satan
// ürünler (adet). Ürün adları için istek anasayfadakiyle aynıdır: dönem son 7 güne giriyorsa
// o günlerin tüm ürünleri istenir ve önbellekten gelir, ek istek atılmaz.
export function useAffiliateSalesReport(affiliateId: number) {
  const orders = useAffiliateOrders(affiliateId);
  const { window, revenueOrders, hasData } = orders;
  const { now } = useCurrentTime();
  const baseRange = useMemo(() => getBaseOrderRange(now), [now]);
  const isInBase = isRangeWithin(window.range, baseRange);
  // Dönem son 7 günse aynı istektir; değilse çalıştırılmaz
  const baseQuery = useOrders(baseRange, { enabled: isInBase });

  const { chartPoints, soldTotal, topProducts } = useMemo(() => {
    const points = getChartPoints(revenueOrders, null, window);

    return {
      chartPoints: points,
      soldTotal: points.reduce((sum, point) => sum + (point.sold ?? 0), 0),
      topProducts: getBestSellers(revenueOrders, window, TOP_PRODUCT_LIMIT),
    };
  }, [revenueOrders, window]);

  const productIds = useMemo(
    () =>
      isInBase
        ? getOrderProductIds(baseQuery.data ?? [])
        : topProducts.map((item) => item.productId),
    [isInBase, baseQuery.data, topProducts],
  );
  const productsQuery = useProductsByIds(productIds);
  const productsById = useMemo(
    () => new Map(productsQuery.data?.map((product) => [product.id, product])),
    [productsQuery.data],
  );
  const isProductsLoading =
    topProducts.length > 0 &&
    productsQuery.isPending &&
    topProducts.some((item) => !productsById.has(item.productId));

  return {
    ...orders,
    chartPoints,
    soldTotal,
    topProducts,
    productsById,
    // Ürün adları gelmeden çubuklar "Ürün #12" diye görünmesin
    isProductsLoading: !hasData || isProductsLoading,
  };
}
