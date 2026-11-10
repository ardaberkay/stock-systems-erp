import { ORDER_STATUS, NOT_SOLD_ITEM_STATUSES } from '@/features/orders/constants/status';
import { LOW_STOCK_LIMIT } from '@/features/products/constants/products';
import {
  REPORT_BUSY_SLOT_LIMIT,
  REPORT_HEAT_COLUMNS,
  REPORT_HEAT_DAYS,
  REPORT_HEAT_HOURS_PER_COLUMN,
  REPORT_PODIUM_SIZE,
} from '@/features/reports/constants';
import type { Order } from '@/features/orders/schemas/orders';
import type { Product } from '@/features/products/schemas/products';
import { listDays } from '@/utils/dateKey';
import { normalizePhone } from '@/features/orders/utils/orderList';
import type { DayRange } from '@/features/period/periodWindow';

const RETURNED_STATUSES: readonly number[] = [
  ORDER_STATUS.returned,
  ORDER_STATUS.partiallyReturned,
];
const CANCELLED_STATUSES: readonly number[] = [
  ORDER_STATUS.cancelled,
  ORDER_STATUS.partiallyCancelled,
];

export type StatusCount = { statusId: number; count: number };

export type ReturnStats = {
  returned: number;
  cancelled: number;
  // Tüm siparişlerin iade veya iptal olan payı
  rate: number;
  // Siparişin oluşturulduğu güne göre; API iadenin yapıldığı tarihi vermez
  days: string[];
  // O gün açılan siparişlerin iade veya iptal olan payı; siparişsiz gün 0'dır
  dailyRate: number[];
  // Basılı tutunca oranın altında gösterilir
  dailyReturned: number[];
  dailyCancelled: number[];
  orders: Order[];
};

export type PaymentShare = { paymentTypeId: number | null; count: number; amount: number };

export type CityCount = { city: string | null; count: number };

export type BrandShare = { brand: string | null; units: number };

export type PartnerSales = { affiliateAccountId: number; count: number; amount: number };

export type CustomerRank = {
  phone: string;
  name: string;
  orderCount: number;
  amount: number;
  rank: number;
};

export type BusySlot = { day: number; column: number; count: number };

export type ProfitStats = {
  revenue: number;
  shipping: number;
  cost: number;
  profit: number;
  // Katalogdaki ürünlerden maliyeti girilmemiş satış adedi; kâr bunlar kadar yüksek görünür
  missingCostCount: number;
};

export type StockStats = {
  totalUnits: number;
  // Satış fiyatı üzerinden; maliyet çoğu mağazada boş olabilir
  stockValue: number;
  outOfStock: Product[];
  lowStock: Product[];
  healthy: Product[];
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function getSoldItems(revenueOrders: Order[]) {
  return revenueOrders.flatMap((order) =>
    order.items.filter((item) => !NOT_SOLD_ITEM_STATUSES.includes(item.statusId)),
  );
}

// Siparişi olmayan durumlar da 0 ile listelenir; API'nin bilinmeyen durumu sona eklenir.
export function getStatusCounts(orders: Order[]): StatusCount[] {
  const counts = new Map<number, number>(
    Object.values(ORDER_STATUS).map((statusId) => [statusId, 0]),
  );

  for (const order of orders) {
    counts.set(order.orderStatusId, (counts.get(order.orderStatusId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([statusId, count]) => ({ statusId, count }))
    .sort((a, b) => b.count - a.count);
}

export function getReturnStats(orders: Order[], range: DayRange): ReturnStats {
  const days = listDays(range.startDay, range.endDay);
  const dayIndex = new Map(days.map((day, index) => [day, index]));
  const dailyOrders = days.map(() => 0);
  const dailyReturned = days.map(() => 0);
  const dailyCancelled = days.map(() => 0);
  const returnOrders: Order[] = [];
  let returned = 0;
  let cancelled = 0;

  for (const order of orders) {
    const isReturned = RETURNED_STATUSES.includes(order.orderStatusId);
    const isCancelled = CANCELLED_STATUSES.includes(order.orderStatusId);
    const index = dayIndex.get(order.orderDateTime.slice(0, 10));

    if (index !== undefined) {
      dailyOrders[index] += 1;
    }

    if (!isReturned && !isCancelled) {
      continue;
    }

    returned += isReturned ? 1 : 0;
    cancelled += isCancelled ? 1 : 0;
    returnOrders.push(order);

    if (index !== undefined) {
      const dailyCounts = isReturned ? dailyReturned : dailyCancelled;

      dailyCounts[index] += 1;
    }
  }

  return {
    returned,
    cancelled,
    rate: orders.length > 0 ? (returned + cancelled) / orders.length : 0,
    days,
    dailyRate: days.map((_, index) =>
      dailyOrders[index] > 0
        ? (dailyReturned[index] + dailyCancelled[index]) / dailyOrders[index]
        : 0,
    ),
    dailyReturned,
    dailyCancelled,
    orders: returnOrders.sort((a, b) => b.orderDateTime.localeCompare(a.orderDateTime)),
  };
}

export function getPaymentShares(revenueOrders: Order[]): PaymentShare[] {
  const shares = new Map<number | null, PaymentShare>();

  for (const order of revenueOrders) {
    const paymentTypeId = order.orderPaymentTypeId;
    const share = shares.get(paymentTypeId) ?? { paymentTypeId, count: 0, amount: 0 };

    share.count += 1;
    share.amount = roundMoney(share.amount + order.orderAmount);
    shares.set(paymentTypeId, share);
  }

  return [...shares.values()].sort((a, b) => b.count - a.count);
}

export function getCityCounts(revenueOrders: Order[]): CityCount[] {
  const counts = new Map<string | null, number>();

  for (const order of revenueOrders) {
    const city = order.deliveryCity?.trim() || null;

    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}

// Marka siparişte yazmaz, ürün kataloğundan bulunur; numarası boş (silinmiş) ürün sayılmaz.
export function getBrandShares(revenueOrders: Order[], products: Product[]): BrandShare[] {
  const brands = new Map(products.map((product) => [product.id, product.brandName?.trim() || null]));
  const units = new Map<string | null, number>();

  for (const item of getSoldItems(revenueOrders)) {
    if (item.productId === null || !brands.has(item.productId)) {
      continue;
    }

    const brand = brands.get(item.productId) ?? null;

    units.set(brand, (units.get(brand) ?? 0) + item.qty);
  }

  return [...units.entries()]
    .map(([brand, count]) => ({ brand, units: count }))
    .sort((a, b) => b.units - a.units);
}

// Ciro siparişin tutarıdır; komisyon tutarı test verisinde hep 0 geldiği için henüz hesaplanmaz.
export function getPartnerSales(revenueOrders: Order[]): PartnerSales[] {
  const partners = new Map<number, PartnerSales>();

  for (const order of revenueOrders) {
    const affiliateAccountId = order.affiliateAccountId;

    if (affiliateAccountId === null) {
      continue;
    }

    const partner = partners.get(affiliateAccountId) ?? { affiliateAccountId, count: 0, amount: 0 };

    partner.count += 1;
    partner.amount = roundMoney(partner.amount + order.orderAmount);
    partners.set(affiliateAccountId, partner);
  }

  return [...partners.values()].sort((a, b) => b.amount - a.amount);
}

// API'de müşteri servisi yok; müşteri telefon numarasından çıkarılır, sıralama dönemle sınırlıdır.
export function getCustomerRanks(revenueOrders: Order[]): CustomerRank[] {
  const customers = new Map<string, CustomerRank>();

  for (const order of revenueOrders) {
    const phone = normalizePhone(order.deliveryPhone ?? '');

    if (!phone) {
      continue;
    }

    const customer = customers.get(phone) ?? {
      phone,
      name: `${order.deliveryFirstName ?? ''} ${order.deliveryLastName ?? ''}`.trim(),
      orderCount: 0,
      amount: 0,
      rank: 0,
    };

    customer.orderCount += 1;
    customer.amount = roundMoney(customer.amount + order.orderAmount);
    customers.set(phone, customer);
  }

  const sorted = [...customers.values()].sort(
    (a, b) => b.orderCount - a.orderCount || b.amount - a.amount,
  );

  // Eşit sipariş aynı sırayı paylaşır, sonraki numara atlanmaz (…3, 3, 4). Podyum numaralarını
  // panelui atlamalı verir (1, 1, 3); liste podyumun gösterdiği numaradan devam eder.
  sorted.forEach((customer, index) => {
    const previous = sorted[index - 1];

    if (previous?.orderCount === customer.orderCount) {
      customer.rank = previous.rank;
    } else {
      customer.rank = index < REPORT_PODIUM_SIZE ? index + 1 : (previous?.rank ?? 0) + 1;
    }
  });

  return sorted;
}

// Tarih Türkiye saatiyle metin olarak gelir; UTC ile okununca gün kaymaz. 0 pazartesidir.
function getWeekdayIndex(dayKey: string): number {
  return (new Date(`${dayKey}T00:00:00Z`).getUTCDay() + 6) % REPORT_HEAT_DAYS;
}

export function getWeekdayCounts(revenueOrders: Order[]): number[] {
  const counts = Array.from({ length: REPORT_HEAT_DAYS }, () => 0);

  for (const order of revenueOrders) {
    counts[getWeekdayIndex(order.orderDateTime.slice(0, 10))] += 1;
  }

  return counts;
}

// Sütunlar saat dilimi, satırlar haftanın günüdür.
export function getBusyGrid(revenueOrders: Order[]): number[][] {
  const grid = Array.from({ length: REPORT_HEAT_COLUMNS }, () =>
    Array.from({ length: REPORT_HEAT_DAYS }, () => 0),
  );

  for (const order of revenueOrders) {
    const hour = Number(order.orderDateTime.slice(11, 13));
    const column = Math.floor(hour / REPORT_HEAT_HOURS_PER_COLUMN);
    const day = getWeekdayIndex(order.orderDateTime.slice(0, 10));

    grid[column][day] += 1;
  }

  return grid;
}

export function getBusySlots(grid: number[][]): BusySlot[] {
  return grid
    .flatMap((days, column) => days.map((count, day) => ({ day, column, count })))
    .filter((slot) => slot.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, REPORT_BUSY_SLOT_LIMIT);
}

export function getProfitStats(revenueOrders: Order[], products: Product[]): ProfitStats {
  const costs = new Map(products.map((product) => [product.id, product.costPrice]));
  const revenue = roundMoney(revenueOrders.reduce((sum, order) => sum + order.orderAmount, 0));
  const shipping = roundMoney(
    revenueOrders.reduce((sum, order) => sum + order.orderShippingValue, 0),
  );
  let cost = 0;
  let missingCostCount = 0;

  for (const item of getSoldItems(revenueOrders)) {
    // Numarası boş kalem silinmiş üründür; maliyeti hiçbir zaman girilemez, uyarıya sayılmaz
    if (item.productId === null) {
      continue;
    }

    const unitCost = costs.get(item.productId) ?? 0;

    if (unitCost > 0) {
      cost += unitCost * item.qty;
    } else {
      missingCostCount += item.qty;
    }
  }

  return {
    revenue,
    shipping,
    cost: roundMoney(cost),
    // Alınan kargo kargo firmasına gider, kâr sayılmaz
    profit: roundMoney(revenue - shipping - cost),
    missingCostCount,
  };
}

export function getStockStats(products: Product[]): StockStats {
  return {
    // Eksi stok toplamı düşürmesin; tükenen ürün zaten ayrı sayılır
    totalUnits: products.reduce((sum, product) => sum + Math.max(product.stock, 0), 0),
    stockValue: roundMoney(
      products.reduce((sum, product) => sum + Math.max(product.stock, 0) * product.price, 0),
    ),
    outOfStock: products.filter((product) => product.stock <= 0),
    lowStock: products
      .filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_LIMIT)
      .sort((a, b) => a.stock - b.stock),
    healthy: products
      .filter((product) => product.stock > LOW_STOCK_LIMIT)
      .sort((a, b) => a.stock - b.stock),
  };
}

// Numarası boş kalem silinmiş üründür; silinen ürün katalogda olmadığı için listeyi etkilemez.
export function getUnsoldProducts(revenueOrders: Order[], products: Product[]): Product[] {
  const soldIds = new Set(getSoldItems(revenueOrders).map((item) => item.productId));

  return products
    .filter((product) => product.stock > 0 && !soldIds.has(product.id))
    .sort((a, b) => b.stock - a.stock);
}
