import TextField from '@/components/ui/form/TextField';
import ProductImage from '@/features/products/components/ProductImage';
import type { OrderCreateFormInput, OrderCreateItem } from '@/features/orders/schemas/orderCreate';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { parseMoney } from '@/features/orders/utils/orderCreate';
import Minus from 'lucide-react-native/icons/minus';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { memo, useMemo } from 'react';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type CartItemRowProps = {
  index: number;
  // Eklendiği andaki ürün bilgisi; adet ve fiyat formdan canlı okunur
  item: OrderCreateItem;
  control: Control<OrderCreateFormInput>;
  colors: AppColors;
  locale: string;
  onRemove: (index: number) => void;
};

const IMAGE_SIZE = 56;
const TRASH_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.md) / 2;

function CartItemRow({ index, item, control, colors, locale, onRemove }: CartItemRowProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const quantity = useWatch({ control, name: `items.${index}.quantity` });
  const price = useWatch({ control, name: `items.${index}.price` });

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <ProductImage uri={item.image} accessibilityLabel={item.name} size={IMAGE_SIZE} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.meta}>
            {`${item.sizeName} · ${t('orders.create.products.stock', {
              value: formatNumber(item.stock, locale),
            })}`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('orders.create.products.remove', { name: item.name })}
          hitSlop={TRASH_HIT_SLOP}
          onPress={() => onRemove(index)}
        >
          <Trash size={ICON_SIZE.md} color={colors.icon} />
        </Pressable>
      </View>

      <View style={styles.bottom}>
        <Controller
          control={control}
          name={`items.${index}.quantity`}
          render={({ field: { value, onChange } }) => (
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('orders.create.products.decrease')}
                disabled={value <= 1}
                onPress={() => onChange(value - 1)}
                style={styles.stepButton}
              >
                <Minus size={ICON_SIZE.sm} color={value <= 1 ? colors.iconDisabled : colors.text} />
              </Pressable>
              <Text style={styles.quantity}>{formatNumber(value, locale)}</Text>
              {/* Stoktan fazlası seçilemez; order/add stoğu düşer */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('orders.create.products.increase')}
                disabled={value >= item.stock}
                onPress={() => onChange(value + 1)}
                style={styles.stepButton}
              >
                <Plus
                  size={ICON_SIZE.sm}
                  color={value >= item.stock ? colors.iconDisabled : colors.text}
                />
              </Pressable>
            </View>
          )}
        />

        <View style={styles.price}>
          <Controller
            control={control}
            name={`items.${index}.price`}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label={t('orders.create.products.unitPrice')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                error={error?.message ? t(error.message) : undefined}
              />
            )}
          />
        </View>
      </View>

      <Text style={styles.lineTotal}>{formatMoney(quantity * parseMoney(price), locale)}</Text>
    </View>
  );
}

export default memo(CartItemRow);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      gap: SPACING.sm,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.md,
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
    meta: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    bottom: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: SPACING.md,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    stepButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantity: {
      ...typography.label,
      minWidth: MIN_TOUCH_SIZE / 2,
      textAlign: 'center',
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    price: {
      flex: 1,
    },
    lineTotal: {
      ...typography.label,
      alignSelf: 'flex-end',
      fontFamily: FONT_FAMILY.bold,
      color: colors.text,
    },
  });
}
