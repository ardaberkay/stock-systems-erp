import { NOT_SOLD_ITEM_STATUSES, REVENUE_ORDER_STATUSES } from '@/constants/orderStatus';
import type { Order } from '@/schemas/orders';
import { listDays } from '@/utils/dateKey';
import type { ChartGranularity, DayRange, PeriodWindow } from '@/utils/periodWindow';

export type OrderTotals = {
  revenue: number;
  orderCount: number;
  soldCount: number;
};

export type ChartPoint = {
  // Saatlikte '14:00', günlükte 'YYYY-MM-DD'
  time: string;
  // Henüz gelmemiş saatlerde null; 0 "satış olmadı" demektir.
  revenue: number | null;
  sold: number | null;
  orders: number | null;
  previousRevenue: number | null;
};

export type BestSeller = {
  productId: number;
  sold: number;
  revenue: number;
  topSize: { name: string; sold: number } | null;
  // Geçmiş saat veya günlerin satış adetleri
  trend: number[];
};

// Önceki ciro 0 iken yüzde hesaplanamaz, tutar farkı gösterilir.
export type RevenueChange =
  | { kind: 'percent'; ratio: number }
  | { kind: 'amount'; amount: number };

// Eksen 24:00'a kadar uzanır; böylece etiketler 00, 06, 12, 18, 24'e tam oturur.
const HOURS_ON_AXIS = 25;

// Kuruş altı kayan nokta artıkları ekrana yansımasın
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

// API aynı siparişi kargo kaydı başına ayrı satır döndürebiliyor.
export function dedupeOrders(orders: Order[]): Order[] {
  return [...new Map(orders.map((order) => [order.id, order])).values()];
}

// Siparişin durumu belirleyicidir; ürün bazlı iptal zaten orderAmount'a yansır.
export function getRevenueOrders(orders: Order[]): Order[] {
  return orders.filter((order) => REVENUE_ORDER_STATUSES.includes(order.orderStatusId));
}

// Panelle aynı: ürün adedinde satırın kendi durumuna bakılmaz.
export function getOrderTotals(revenueOrders: Order[]): OrderTotals {
  return {
    revenue: roundMoney(revenueOrders.reduce((sum, order) => sum + order.orderAmount, 0)),
    orderCount: revenueOrders.length,
    soldCount: revenueOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.qty, 0),
      0,
    ),
  };
}

// İki dönem de 0 ise anlatılacak değişim yoktur, rozet gizlenir.
export function getRevenueChange(current: number, previous: number): RevenueChange | null {
  if (previous > 0) {
    return { kind: 'percent', ratio: (current - previous) / previous };
  }

  return current > 0 ? { kind: 'amount', amount: current } : null;
}

export function filterUntil(orders: Order[], cutoff: string | null): Order[] {
  return cutoff ? orders.filter((order) => order.orderDateTime <= cutoff) : orders;
}

function getHourKey(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function getBucketKey(orderDateTime: string, granularity: ChartGranularity): string {
  return granularity === 'day' ? orderDateTime.slice(0, 10) : `${orderDateTime.slice(11, 13)}:00`;
}

function getAxisKeys(range: DayRange, granularity: ChartGranularity): string[] {
  return granularity === 'day'
    ? listDays(range.startDay, range.endDay)
    : Array.from({ length: HOURS_ON_AXIS }, (_, hour) => getHourKey(hour));
}

function getPreviousRevenues(
  previousRevenueOrders: Order[],
  window: PeriodWindow,
): Map<string, number> {
  const revenues = new Map<string, number>();

  for (const order of previousRevenueOrders) {
    const key = getBucketKey(order.orderDateTime, window.granularity);
    revenues.set(key, roundMoney((revenues.get(key) ?? 0) + order.orderAmount));
  }

  return revenues;
}

// Önceki dönem sıra sırasına hizalanır: bugünün 14:00'ı dünün 14:00'ıyla, son 7 günün
// ilk günü önceki 7 günün ilk günüyle aynı noktadadır.
export function getChartPoints(
  revenueOrders: Order[],
  previousRevenueOrders: Order[] | null,
  window: PeriodWindow,
): ChartPoint[] {
  const keys = getAxisKeys(window.range, window.granularity);
  const previousKeys = getAxisKeys(window.previousRange, window.granularity);
  const previousRevenues = previousRevenueOrders
    ? getPreviousRevenues(previousRevenueOrders, window)
    : null;

  const points = new Map<string, ChartPoint>(
    keys.map((time, index) => {
      const isComingHour = window.granularity === 'hour' && index > window.lastHour;
      const isAxisEnd = window.granularity === 'hour' && index === HOURS_ON_AXIS - 1;
      const value = isComingHour ? null : 0;

      return [
        time,
        {
          time,
          revenue: value,
          sold: value,
          orders: value,
          previousRevenue:
            previousRevenues && !isAxisEnd ? (previousRevenues.get(previousKeys[index]) ?? 0) : null,
        },
      ];
    }),
  );

  for (const order of revenueOrders) {
    const point = points.get(getBucketKey(order.orderDateTime, window.granularity));

    if (point && point.revenue !== null) {
      point.revenue = roundMoney(point.revenue + order.orderAmount);
      point.orders = (point.orders ?? 0) + 1;
      point.sold = (point.sold ?? 0) + order.items.reduce((sum, item) => sum + item.qty, 0);
    }
  }

  return [...points.values()];
}

function getTrendKeys(window: PeriodWindow): string[] {
  if (window.granularity === 'day') {
    return getAxisKeys(window.range, 'day');
  }

  // Gece yarısından hemen sonra da çizilebilecek en az iki nokta olur.
  return Array.from({ length: Math.max(window.lastHour, 1) + 1 }, (_, hour) => getHourKey(hour));
}

export function getBestSellers(
  revenueOrders: Order[],
  window: PeriodWindow,
  limit: number,
): BestSeller[] {
  const trendKeys = getTrendKeys(window);
  const trendIndex = new Map(trendKeys.map((key, index) => [key, index]));
  const products = new Map<
    number,
    { sold: number; revenue: number; sizes: Map<string, number>; trend: number[] }
  >();

  for (const order of revenueOrders) {
    const bucket = trendIndex.get(getBucketKey(order.orderDateTime, window.granularity));

    for (const item of order.items) {
      if (NOT_SOLD_ITEM_STATUSES.includes(item.statusId)) {
        continue;
      }

      const product = products.get(item.productId) ?? {
        sold: 0,
        revenue: 0,
        sizes: new Map<string, number>(),
        trend: trendKeys.map(() => 0),
      };

      product.sold += item.qty;
      product.revenue = roundMoney(product.revenue + item.price * item.qty);

      if (item.variantName) {
        product.sizes.set(item.variantName, (product.sizes.get(item.variantName) ?? 0) + item.qty);
      }
      if (bucket !== undefined) {
        product.trend[bucket] += item.qty;
      }

      products.set(item.productId, product);
    }
  }

  return [...products.entries()]
    .map(([productId, { sold, revenue, sizes, trend }]) => {
      const [topSize] = [...sizes.entries()].sort((a, b) => b[1] - a[1]);

      return {
        productId,
        sold,
        revenue,
        topSize: topSize ? { name: topSize[0], sold: topSize[1] } : null,
        trend,
      };
    })
    .sort((a, b) => b.sold - a.sold || b.revenue - a.revenue)
    .slice(0, limit);
}
