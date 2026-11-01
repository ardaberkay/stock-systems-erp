import type { OrderFilters } from '@/constants/orderFilters';
import type { Order } from '@/schemas/orders';
import { dedupeOrders } from '@/utils/orderStats';
import { normalizeText } from '@/utils/productList';

export type OrderSearch = { kind: 'id' | 'phone'; value: string };

const PHONE_DIGITS = 10;

// Kullanıcı 0545…, +90 545… veya 545… yazabilir; API 5XXXXXXXXX ister.
export function normalizePhone(text: string): string {
  const digits = text.replace(/\D/g, '');

  return digits.length > PHONE_DIGITS ? digits.slice(-PHONE_DIGITS) : digits;
}

// Harf varsa ad aranıyordur ve yalnızca telefonda aranır. Yalnızca rakamsa sunucuya da sorulabilir:
// 10 ve üzeri hane telefon, daha azı sipariş numarasıdır.
export function parseOrderSearch(query: string): OrderSearch | null {
  const cleaned = query.replace(/[\s()#+-]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return null;
  }

  return cleaned.length >= PHONE_DIGITS
    ? { kind: 'phone', value: normalizePhone(cleaned) }
    : { kind: 'id', value: cleaned };
}

// Sayfalar yeni aralıklardan eskiye gelir; API sırası güvenilmez, en yeni sipariş üstte tutulur.
export function mergeOrders(orders: Order[]): Order[] {
  return dedupeOrders(orders).sort((a, b) => b.orderDateTime.localeCompare(a.orderDateTime));
}

function matchesSearch(order: Order, search: string, phoneSearch: string): boolean {
  const name = `${order.deliveryFirstName ?? ''} ${order.deliveryLastName ?? ''}`;

  return (
    normalizeText(name).includes(search) ||
    String(order.id).includes(search) ||
    normalizeText(order.shippingTrackCode ?? '').includes(search) ||
    normalizeText(order.shippingTrackCode2 ?? '').includes(search) ||
    (phoneSearch.length > 0 && (order.deliveryPhone ?? '').includes(phoneSearch))
  );
}

function matchesFilters(order: Order, filters: OrderFilters): boolean {
  return (
    (filters.statusIds.length === 0 || filters.statusIds.includes(order.orderStatusId)) &&
    (filters.customStatusId === null || order.orderCustomStatusId === filters.customStatusId) &&
    (filters.paymentTypeId === null || order.orderPaymentTypeId === filters.paymentTypeId) &&
    (filters.cargoCompanyId === null || order.shippingCargoCompanyId === filters.cargoCompanyId) &&
    (filters.affiliateAccountId === null || order.affiliateAccountId === filters.affiliateAccountId)
  );
}

export function getVisibleOrders(orders: Order[], query: string, filters: OrderFilters): Order[] {
  const search = normalizeText(query);
  // Kayıtlı telefonlarda baştaki 0 yok; "0545" diye yazan da bulabilsin
  const phoneSearch = parseOrderSearch(query) ? normalizePhone(query).replace(/^0/, '') : '';

  return orders.filter(
    (order) =>
      matchesFilters(order, filters) &&
      (search.length === 0 || matchesSearch(order, search, phoneSearch)),
  );
}

export function hasActiveOrderFilters(filters: OrderFilters): boolean {
  return (
    filters.statusIds.length > 0 ||
    filters.customStatusId !== null ||
    filters.paymentTypeId !== null ||
    filters.cargoCompanyId !== null ||
    filters.affiliateAccountId !== null
  );
}
