import { ORDER_STATUS } from '@/features/orders/constants/status';
import type { PeriodSelection } from '@/features/period/constants';
import type { LucideIcon } from 'lucide-react-native';
import Banknote from 'lucide-react-native/icons/banknote';
import CreditCard from 'lucide-react-native/icons/credit-card';
import FileText from 'lucide-react-native/icons/file-text';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Truck from 'lucide-react-native/icons/truck';
import Wallet from 'lucide-react-native/icons/wallet';

// Sipariş dönemleri; görünen ad `filters.<anahtar>` çevirisinden gelir.
// Bu ay ayın 1'inden bugüne, geçen ay önceki ayın tamamını kapsar.
export const ORDER_PERIODS = [
  'today',
  'yesterday',
  'weekly',
  'monthly',
  'thisMonth',
  'lastMonth',
] as const;

export type OrderPeriod = (typeof ORDER_PERIODS)[number];

export type OrderPeriodSelection = PeriodSelection<OrderPeriod>;

export const DEFAULT_ORDER_PERIOD: OrderPeriodSelection = { kind: 'preset', period: 'weekly' };

// Ana sayfa ve siparişlerin ortak kullandığı veri; bu aralıktaki dönemler anında gösterilir.
export const ORDER_BASE_DAYS = 7;

export type OrderFilters = {
  statusIds: number[];
  customStatusId: number | null;
  paymentTypeId: number | null;
  cargoCompanyId: number | null;
  affiliateAccountId: number | null;
};

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  statusIds: [],
  customStatusId: null,
  paymentTypeId: null,
  cargoCompanyId: null,
  affiliateAccountId: null,
};

// "Ödeme Bekliyor" panelde seçilemez, yalnızca API'den gelirse listede gösterilir.
export const ORDER_STATUS_FILTERS = [
  ORDER_STATUS.received,
  ORDER_STATUS.approved,
  ORDER_STATUS.notApproved,
  ORDER_STATUS.packing,
  ORDER_STATUS.shipped,
  ORDER_STATUS.delivered,
  ORDER_STATUS.returned,
  ORDER_STATUS.cancelled,
  ORDER_STATUS.partiallyReturned,
  ORDER_STATUS.partiallyCancelled,
] as const;

export type OrderBulkActionKey = 'cargo' | 'invoice' | 'status';

type OrderBulkAction = {
  key: OrderBulkActionKey;
  icon: LucideIcon;
};

// Görünen ad `orders.bulkAction.<anahtar>` çevirisinden gelir; yeni işlem buraya eklenir.
export const ORDER_BULK_ACTIONS: OrderBulkAction[] = [
  { key: 'cargo', icon: Truck },
  { key: 'invoice', icon: FileText },
  { key: 'status', icon: RefreshCw },
];

type OrderPaymentDisplay = {
  icon: LucideIcon;
};

const CASH_ON_DELIVERY_ID = 1;
const CARD_ON_DELIVERY_ID = 2;

const ORDER_PAYMENT_DISPLAY = new Map<number, OrderPaymentDisplay>([
  [CASH_ON_DELIVERY_ID, { icon: Banknote }],
  [CARD_ON_DELIVERY_ID, { icon: CreditCard }],
]);

// Peşin ve API'nin ileride ekleyeceği türler cüzdanla görünür; kart boş kalmaz.
const DEFAULT_PAYMENT: OrderPaymentDisplay = { icon: Wallet };

export function getOrderPaymentDisplay(paymentTypeId: number | null): OrderPaymentDisplay {
  if (paymentTypeId === null) {
    return DEFAULT_PAYMENT;
  }
  return ORDER_PAYMENT_DISPLAY.get(paymentTypeId) ?? DEFAULT_PAYMENT;
}
