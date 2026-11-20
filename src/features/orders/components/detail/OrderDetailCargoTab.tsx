import Button from '@/components/ui/Button';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import Text from '@/components/ui/Text';
import OrderTimeline from '@/features/orders/components/detail/OrderTimeline';
import { isShippingPayer } from '@/features/orders/constants/detail';
import type { OrderCargo } from '@/features/orders/hooks/useOrderLookups';
import type { Order } from '@/features/orders/schemas/orders';
import { getCargoSteps } from '@/features/orders/utils/orderDetail';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type OrderDetailCargoTabProps = {
  order: Order;
  cargo: OrderCargo | undefined;
};

// Pasif butonlar için; basılamadıkları için hiç çağrılmaz
const noop = () => {};

// Kargo bölümünün okuma hali: firma, takip bilgileri ve kargo adımları
export default function OrderDetailCargoTab({ order, cargo }: OrderDetailCargoTabProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <DetailSection title={t('orders.detail.sections.cargo')} variant="plain">
      <DetailRow
        label={t('orders.detail.cargoCompany')}
        value={cargo?.isStorePickup ? t('orders.storePickup') : cargo?.name}
      />
      <DetailRow label={t('orders.detail.carrier')} value={order.shippingCarrierBranchName} />
      <DetailRow label={t('orders.detail.trackCode')} value={order.shippingTrackCode} selectable />
      <DetailRow label={t('orders.detail.barcode')} value={order.shippingTrackCode2} selectable />
      <DetailRow
        label={t('orders.detail.deci')}
        value={
          order.shippingPackageDeciValue === null
            ? null
            : formatNumber(order.shippingPackageDeciValue, locale)
        }
      />
      <DetailRow
        label={t('orders.detail.shippingPayer')}
        value={
          order.deliveryWhoPaysShipping
            ? isShippingPayer(order.deliveryWhoPaysShipping)
              ? t(`orders.detail.shippingPayers.${order.deliveryWhoPaysShipping}`)
              : t('orders.detail.unknown')
            : null
        }
      />
      {order.shippingTrackCode || order.shippingTrackCode2 ? (
        <Text style={styles.note}>{t('orders.detail.copyHint')}</Text>
      ) : null}
      <View style={styles.divider} />
      {/* Kargo firmasının bildirimleri; veri gelene kadar adımlar bekliyor görünür */}
      <Text style={styles.subTitle} accessibilityRole="header">
        {t('orders.detail.cargoSteps')}
      </Text>
      <OrderTimeline steps={getCargoSteps()} />
      <View style={styles.divider} />
      {/* API'de kargoya gönderme servisi yok; yeri hazır, servis gelince bağlanır */}
      <Button label={t('orders.editMode.shipToCargo')} onPress={noop} disabled />
    </DetailSection>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    subTitle: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
    note: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
