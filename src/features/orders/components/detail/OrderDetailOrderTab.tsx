import DetailNote from '@/components/ui/DetailNote';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import ContactActions from '@/features/orders/components/detail/ContactActions';
import OrderItemRow from '@/features/orders/components/detail/OrderItemRow';
import OrderTimeline from '@/features/orders/components/detail/OrderTimeline';
import type { OrderPartner } from '@/features/orders/hooks/useOrderLookups';
import type { Order } from '@/features/orders/schemas/orders';
import { getOrderTimeline } from '@/features/orders/utils/orderDetail';
import type { Product } from '@/features/products/schemas/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type OrderDetailOrderTabProps = {
  order: Order;
  productsById: Map<number, Product>;
  isProductsPending: boolean;
  paymentName: string | undefined;
  partner: OrderPartner | undefined;
  customStatusName: string | undefined;
};

// Sipariş bölümünün okuma hali: özel durum + çizelge, ürünler + tutar + ödeme, notlar
export default function OrderDetailOrderTab({
  order,
  productsById,
  isProductsPending,
  paymentName,
  partner,
  customStatusName,
}: OrderDetailOrderTabProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const itemCount = order.items.reduce((total, item) => total + item.qty, 0);

  return (
    <>
      {/* Özel durum (mağazanın kendi oluşturduğu, adı uzun olabilir) tam satırda; düzenlemede de
          alanı bu grupta. Altında sipariş alındı, barkod, kargoya verildi ve teslim tarihleri. */}
      <DetailSection title={t('orders.detail.sections.timeline')} variant="plain">
        <DetailRow label={t('orders.customStatusTitle')} value={customStatusName} />
        <View style={styles.divider} />
        <OrderTimeline steps={getOrderTimeline(order)} />
      </DetailSection>

      {/* Ürünler, tutar ve ödeme tek grupta: sipariş toplamı ürünlerin hemen altında okunur */}
      <DetailSection
        title={`${t('orders.detail.sections.items')} · ${t('orders.itemCount', {
          value: formatNumber(itemCount, locale),
        })}`}
        variant="plain"
      >
        {order.items.map((item, index) => (
          <OrderItemRow
            key={item.id ?? index}
            item={item}
            product={item.productId === null ? undefined : productsById.get(item.productId)}
            isProductLoading={isProductsPending}
            orderStatusId={order.orderStatusId}
            locale={locale}
          />
        ))}
        <View style={styles.divider} />
        {/* Tutar satırları tek blok, aralarında çizgi yok (fiş gibi); ayrı kutuda oldukları için
            DetailSection çizgi eklemez */}
        <View style={styles.amounts}>
          <DetailRow
            label={t('orders.detail.productsTotal')}
            value={
              order.orderProductsValue === null
                ? null
                : formatMoney(order.orderProductsValue, locale)
            }
          />
          <DetailRow
            label={t('orders.detail.shippingFee')}
            value={formatMoney(order.orderShippingValue, locale)}
          />
          <DetailRow
            label={t('orders.detail.total')}
            value={formatMoney(order.orderAmount, locale)}
            emphasized
          />
        </View>
        <View style={styles.divider} />
        <DetailRow label={t('orders.detail.paymentType')} value={paymentName} />
        <DetailRow
          label={t('orders.detail.paymentConfirm')}
          value={order.orderPaymentConfirm === 1 ? t('orders.detail.paymentConfirmed') : null}
        />
        <DetailRow
          label={t('orders.detail.partner')}
          value={partner?.name}
          actions={
            partner?.phone ? (
              <ContactActions
                phone={partner.phone}
                whatsappLabel={t('orders.whatsappPartner', { name: partner.name })}
                whatsappMessage={t('orders.whatsappPartnerMessage', { id: order.id })}
              />
            ) : null
          }
        />
      </DetailSection>

      <DetailSection title={t('orders.detail.sections.notes')} variant="plain">
        {/* Paneldeki "Açıklama" description'a, "Ek bilgiler" description2'ye yazılır */}
        <DetailNote label={t('orders.detail.description')} value={order.description} />
        <DetailNote label={t('orders.detail.description2')} value={order.description2} />
      </DetailSection>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    // Grubun satır aralığıyla aynı (DetailSection plain)
    amounts: {
      gap: SPACING.md,
    },
  });
}
