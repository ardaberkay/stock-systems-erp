import { ORDER_STATUS } from '@/features/orders/constants/status';
import type { Order } from '@/features/orders/schemas/orders';

export type OrderTimelineStepKey =
  | 'received'
  | 'barcode'
  | 'shipped'
  | 'transfer'
  | 'branch'
  | 'outForDelivery'
  | 'delivered';

// Kargo firmasından gelecek beş bildirim; adlar tahmindir, gerçek bildirimler gelince düzeltilir
const CARGO_STEP_KEYS: readonly OrderTimelineStepKey[] = [
  'shipped',
  'transfer',
  'branch',
  'outForDelivery',
  'delivered',
];

// Takip verisi henüz yok (firma ya da backend sağlayacak); adımlar bekliyor olarak gösterilir
export function getCargoSteps(): OrderTimelineStep[] {
  return CARGO_STEP_KEYS.map((key) => ({ key, done: false, dateTime: null }));
}

export type OrderTimelineStep = {
  key: OrderTimelineStepKey;
  done: boolean;
  // API yalnızca sipariş, barkod ve teslim tarihini verir; kargoya veriliş tarihi yoktur
  dateTime: string | null;
};

const SHIPPED_STATUSES: readonly number[] = [ORDER_STATUS.shipped, ORDER_STATUS.delivered];

// Kargo firmasının ara adımları API'de yok; ilerleyiş elimizdeki tarih ve durumdan kurulur.
// Sonraki adım gerçekleşmişse öncekiler de gerçekleşmiş sayılır.
export function getOrderTimeline(order: Order): OrderTimelineStep[] {
  const isDelivered =
    order.orderStatusId === ORDER_STATUS.delivered || Boolean(order.orderDeliveryDateTime);
  const isShipped = isDelivered || SHIPPED_STATUSES.includes(order.orderStatusId);
  const hasBarcode = isShipped || Boolean(order.shippingBarcodeCreateDateTime);

  return [
    { key: 'received', done: true, dateTime: order.orderDateTime },
    {
      key: 'barcode',
      done: hasBarcode,
      dateTime: order.shippingBarcodeCreateDateTime ?? null,
    },
    { key: 'shipped', done: isShipped, dateTime: null },
    { key: 'delivered', done: isDelivered, dateTime: order.orderDeliveryDateTime ?? null },
  ];
}

export function getFullName(firstName: string | null | undefined, lastName: string | null | undefined) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

export function getAddressLine(
  address: string | null | undefined,
  district: string | null | undefined,
  city: string | null | undefined,
) {
  const region = [district, city].filter(Boolean).join(' / ');

  return [address, region].filter(Boolean).join('\n');
}
