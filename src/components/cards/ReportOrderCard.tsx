import OrderCard from '@/components/cards/OrderCard';
import type { useOrderLookups } from '@/hooks/useOrderLookups';
import type { Order } from '@/schemas/orders';
import type { AppColors } from '@/theme/colors';
import { getWhatsAppUrl } from '@/utils/whatsapp';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

type ReportOrderCardProps = {
  order: Order;
  lookups: ReturnType<typeof useOrderLookups>;
  colors: AppColors;
  locale: string;
};

function openOrder(orderId: number) {
  router.push({ pathname: '/order-detail/[id]', params: { id: String(orderId) } });
}

function editOrder(orderId: number) {
  router.push({ pathname: '/order-edit/[id]', params: { id: String(orderId) } });
}

// Rapor sayfalarında toplu seçim yoktur; kart yine de zorunlu prop olarak ister
function ignoreSelect() {}

function ReportOrderCard({ order, lookups, colors, locale }: ReportOrderCardProps) {
  const { t } = useTranslation();
  const { cargos, paymentNames, customStatusNames, partners } = lookups;

  const openWhatsApp = useCallback(
    (phone: string, message: string) => {
      Linking.openURL(getWhatsAppUrl(phone, message)).catch(() => {
        Alert.alert(t('orders.whatsappError'));
      });
    },
    [t],
  );

  return (
    <OrderCard
      order={order}
      paymentName={
        order.orderPaymentTypeId === null ? undefined : paymentNames.get(order.orderPaymentTypeId)
      }
      cargo={
        order.shippingCargoCompanyId === null ? undefined : cargos.get(order.shippingCargoCompanyId)
      }
      customStatusName={
        order.orderCustomStatusId === null
          ? undefined
          : customStatusNames.get(order.orderCustomStatusId)
      }
      partner={order.affiliateAccountId === null ? undefined : partners.get(order.affiliateAccountId)}
      colors={colors}
      locale={locale}
      isSelecting={false}
      isSelected={false}
      onOpen={openOrder}
      onEdit={editOrder}
      onToggleSelect={ignoreSelect}
      onWhatsApp={openWhatsApp}
    />
  );
}

export default memo(ReportOrderCard);
