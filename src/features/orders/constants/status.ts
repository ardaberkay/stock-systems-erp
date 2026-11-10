import type { LucideIcon } from 'lucide-react-native';
import Ban from 'lucide-react-native/icons/ban';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import CircleDashed from 'lucide-react-native/icons/circle-dashed';
import CircleSlash from 'lucide-react-native/icons/circle-slash';
import CircleX from 'lucide-react-native/icons/circle-x';
import Clock from 'lucide-react-native/icons/clock';
import Inbox from 'lucide-react-native/icons/inbox';
import Package from 'lucide-react-native/icons/package';
import PackageCheck from 'lucide-react-native/icons/package-check';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import Truck from 'lucide-react-native/icons/truck';
import Undo2 from 'lucide-react-native/icons/undo-2';

// Kimlikler web paneldeki sipariş durumlarıyla test edilerek doğrulandı.
export const ORDER_STATUS = {
  paymentPending: 1,
  received: 2,
  approved: 3,
  notApproved: 4,
  shipped: 5,
  delivered: 6,
  returned: 7,
  cancelled: 8,
  partiallyReturned: 13,
  partiallyCancelled: 14,
  packing: 15,
} as const;

// Ciroya giren durumlar; panelle aynı rakamı vermesi için kural yalnızca buradadır.
// Bilinmeyen yeni bir durum, buraya eklenene kadar ciroya sayılmaz.
export const REVENUE_ORDER_STATUSES: readonly number[] = [
  ORDER_STATUS.received,
  ORDER_STATUS.approved,
  ORDER_STATUS.packing,
  ORDER_STATUS.shipped,
  ORDER_STATUS.delivered,
];

// Çok satanlarda sayılmayan ürün satırları. Panelde karşılığı yok, bu bizim kuralımız.
export const NOT_SOLD_ITEM_STATUSES: readonly number[] = [
  ORDER_STATUS.returned,
  ORDER_STATUS.cancelled,
  ORDER_STATUS.partiallyReturned,
];

export type OrderStatusTone =
  | 'orange'
  | 'blue'
  | 'green'
  | 'purple'
  | 'success'
  | 'error'
  | 'yellow'
  | 'cyan'
  | 'pink'
  | 'brown'
  | 'neutral';

type OrderStatusKey = keyof typeof ORDER_STATUS | 'unknown';

type OrderStatusDisplay = {
  key: OrderStatusKey;
  icon: LucideIcon;
  tone: OrderStatusTone;
};

// Her durumun kendi rengi var; rapor grafiği ve rozet durumu renkten de ayırt ettirir.
const ORDER_STATUS_DISPLAY = new Map<number, OrderStatusDisplay>([
  [ORDER_STATUS.paymentPending, { key: 'paymentPending', icon: Clock, tone: 'yellow' }],
  [ORDER_STATUS.received, { key: 'received', icon: Inbox, tone: 'blue' }],
  [ORDER_STATUS.approved, { key: 'approved', icon: CircleCheck, tone: 'green' }],
  [ORDER_STATUS.notApproved, { key: 'notApproved', icon: CircleX, tone: 'brown' }],
  [ORDER_STATUS.packing, { key: 'packing', icon: Package, tone: 'purple' }],
  [ORDER_STATUS.shipped, { key: 'shipped', icon: Truck, tone: 'cyan' }],
  [ORDER_STATUS.delivered, { key: 'delivered', icon: PackageCheck, tone: 'success' }],
  [ORDER_STATUS.returned, { key: 'returned', icon: Undo2, tone: 'orange' }],
  [ORDER_STATUS.cancelled, { key: 'cancelled', icon: Ban, tone: 'error' }],
  [ORDER_STATUS.partiallyReturned, { key: 'partiallyReturned', icon: RotateCcw, tone: 'pink' }],
  [ORDER_STATUS.partiallyCancelled, { key: 'partiallyCancelled', icon: CircleSlash, tone: 'neutral' }],
]);

// API yeni bir durum eklerse liste bozulmaz, gri rozetle görünür.
const UNKNOWN_STATUS: OrderStatusDisplay = { key: 'unknown', icon: CircleDashed, tone: 'neutral' };

export function getOrderStatusDisplay(statusId: number): OrderStatusDisplay {
  return ORDER_STATUS_DISPLAY.get(statusId) ?? UNKNOWN_STATUS;
}
