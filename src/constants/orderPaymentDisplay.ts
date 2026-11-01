import type { LucideIcon } from 'lucide-react-native';
import Banknote from 'lucide-react-native/icons/banknote';
import CreditCard from 'lucide-react-native/icons/credit-card';
import Wallet from 'lucide-react-native/icons/wallet';

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
