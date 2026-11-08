import OrderItemRow from '@/components/order/OrderItemRow';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Order } from '@/schemas/orders';
import type { Product } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import Minus from 'lucide-react-native/icons/minus';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type OrderEditItemRowProps = {
  item: Order['items'][number];
  product: Product | undefined;
  isProductLoading: boolean;
  orderStatusId: number;
  locale: string;
};

// Pasif kontroller için; basılamadıkları için hiç çağrılmaz
const noop = () => {};

// Düzenlemede ürün satırı: adet ve silme kontrolleri yerinde durur ama API ürün güncellemeyi
// desteklemediği için şimdilik pasiftir (order/update items alanı hata veriyor).
export default function OrderEditItemRow({
  item,
  product,
  isProductLoading,
  orderStatusId,
  locale,
}: OrderEditItemRowProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const lockedHint = t('orders.editMode.locked');

  return (
    <View style={styles.container}>
      <OrderItemRow
        item={item}
        product={product}
        isProductLoading={isProductLoading}
        orderStatusId={orderStatusId}
        locale={locale}
      />
      <View style={styles.actions}>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('orders.editMode.decreaseQty')}
            accessibilityHint={lockedHint}
            accessibilityState={{ disabled: true }}
            disabled
            onPress={noop}
            style={styles.stepButton}
          >
            <Minus size={ICON_SIZE.sm} color={colors.iconDisabled} />
          </Pressable>
          <Text style={styles.qty}>{formatNumber(item.qty, locale)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('orders.editMode.increaseQty')}
            accessibilityHint={lockedHint}
            accessibilityState={{ disabled: true }}
            disabled
            onPress={noop}
            style={styles.stepButton}
          >
            <Plus size={ICON_SIZE.sm} color={colors.iconDisabled} />
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('orders.editMode.removeItem')}
          accessibilityHint={lockedHint}
          accessibilityState={{ disabled: true }}
          disabled
          onPress={noop}
          style={styles.stepButton}
        >
          <Trash size={ICON_SIZE.md} color={colors.iconDisabled} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.xs,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qty: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      minWidth: MIN_TOUCH_SIZE,
      textAlign: 'center',
      color: colors.textDisabled,
    },
  });
}
