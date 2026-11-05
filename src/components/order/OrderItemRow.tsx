import Skeleton from '@/components/skeleton/Skeleton';
import OrderStatusBadge from '@/components/ui/order/OrderStatusBadge';
import ProductImage from '@/components/ui/product/ProductImage';
import { ORDER_STATUS } from '@/constants/orderStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Order } from '@/schemas/orders';
import type { Product } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type OrderItemRowProps = {
  item: Order['items'][number];
  product: Product | undefined;
  // Ürün adı ve görseli ayrı istekle gelir; beklerken iskelet görünür
  isProductLoading: boolean;
  orderStatusId: number;
  locale: string;
};

const ITEM_IMAGE_SIZE = 64;
const PRESSED_OPACITY = 0.6;

// Kalem durumu yalnızca panelde ürün bazında iade veya iptal edildiğinde anlamlıdır;
// diğer durumlarda kalem varsayılan "alındı"da kalır, siparişin durumu geçerlidir.
const ITEM_STATUSES_TO_SHOW: readonly number[] = [
  ORDER_STATUS.returned,
  ORDER_STATUS.cancelled,
  ORDER_STATUS.partiallyReturned,
  ORDER_STATUS.partiallyCancelled,
];

export default function OrderItemRow({
  item,
  product,
  isProductLoading,
  orderStatusId,
  locale,
}: OrderItemRowProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const productId = item.productId;
  // Silinmiş ürünün kalemi kimliksiz gelir; adı ve görseli artık bilinemez.
  // İstek hata verirse yedek ad "Ürün #id" görünür.
  const name =
    product?.name ??
    (productId === null
      ? t('orders.detail.productMissing')
      : t('dashboard.productFallback', { id: productId }));
  const details = [product?.colorName, item.variantName].filter(Boolean).join(' · ');
  const showItemStatus =
    item.statusId !== orderStatusId && ITEM_STATUSES_TO_SHOW.includes(item.statusId);
  const showSkeleton = isProductLoading && !product && productId !== null;

  return (
    <Pressable
      // Kimliği olmayan (silinmiş) ürünün açılacak detayı yok
      disabled={productId === null}
      accessibilityRole="button"
      accessibilityLabel={t('orders.detail.openProduct', { name })}
      onPress={() => {
        if (productId === null) return;
        router.push({ pathname: '/product-detail/[id]', params: { id: String(productId) } });
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <ProductImage uri={product?.image} accessibilityLabel={name} size={ITEM_IMAGE_SIZE} />

      {showSkeleton ? (
        <View style={styles.info}>
          <Skeleton width="70%" height={typography.label.lineHeight} />
          <Skeleton width="40%" height={typography.caption.lineHeight} />
        </View>
      ) : (
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {details ? <Text style={styles.details}>{details}</Text> : null}
          {product?.modelCode ? (
            <Text style={styles.details}>
              {t('orders.detail.modelCode', { value: product.modelCode })}
            </Text>
          ) : null}
          {showItemStatus ? (
            <View style={styles.status}>
              <OrderStatusBadge statusId={item.statusId} colors={colors} />
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.price}>
        <Text style={styles.lineTotal}>{formatMoney(item.qty * item.price, locale)}</Text>
        <Text style={styles.unitPrice}>
          {t('orders.detail.qtyTimesPrice', {
            qty: formatNumber(item.qty, locale),
            price: formatMoney(item.price, locale),
          })}
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.md,
    },
    pressed: {
      opacity: PRESSED_OPACITY,
    },
    info: {
      flex: 1,
      gap: SPACING.xxs,
      minWidth: 0,
    },
    name: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    details: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    status: {
      flexDirection: 'row',
      marginTop: SPACING.xxs,
    },
    price: {
      alignItems: 'flex-end',
      gap: SPACING.xxs,
      flexShrink: 0,
    },
    lineTotal: {
      ...typography.label,
      fontFamily: FONT_FAMILY.bold,
      color: colors.text,
    },
    unitPrice: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
