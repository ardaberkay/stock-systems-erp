import Badge from '@/components/ui/Badge';
import { getOrderStatusDisplay } from '@/features/orders/constants/status';
import type { AppColors } from '@/theme/colors';
import { getOrderStatusToneColors } from '@/features/orders/utils/orderStatusColor';
import { useTranslation } from 'react-i18next';

type OrderStatusBadgeProps = {
  statusId: number;
  colors: AppColors;
};

// Sipariş durumu: ortak rozet, durumun renginde ve ikonuyla. Durum adı hep tam okunsun diye
// rozet küçülmez; yer darsa satırın diğer tarafı kısalır.
export default function OrderStatusBadge({ statusId, colors }: OrderStatusBadgeProps) {
  const { t } = useTranslation();
  const { key, icon, tone } = getOrderStatusDisplay(statusId);

  return (
    <Badge
      label={t(`orders.status.${key}`)}
      palette={getOrderStatusToneColors(tone, colors)}
      icon={icon}
    />
  );
}
