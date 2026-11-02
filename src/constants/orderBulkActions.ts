import type { LucideIcon } from 'lucide-react-native';
import FileText from 'lucide-react-native/icons/file-text';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Truck from 'lucide-react-native/icons/truck';

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
