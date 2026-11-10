import AnimatedChevron from '@/components/ui/AnimatedChevron';
import ProductImage from '@/features/products/components/ProductImage';
import type { Product, ProductVariant } from '@/features/products/schemas/products';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type ProductPickerRowProps = {
  product: Product;
  expanded: boolean;
  // Sepetteki adetler; yalnızca açık satıra verilir ki diğer satırlar yeniden çizilmesin
  cartQuantities: ReadonlyMap<number, number> | null;
  colors: AppColors;
  locale: string;
  onToggle: (productId: number) => void;
  onPick: (product: Product, variant: ProductVariant) => void;
};

const IMAGE_SIZE = 48;
const PRESSED_OPACITY = 0.6;

function ProductPickerRow({
  product,
  expanded,
  cartQuantities,
  colors,
  locale,
  onToggle,
  onPick,
}: ProductPickerRowProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isOutOfStock = product.stock <= 0;
  const subtitle = [product.modelCode, product.colorName].filter(Boolean).join(' · ');

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('orders.create.products.showSizes', { name: product.name })}
        accessibilityState={{ expanded, disabled: isOutOfStock }}
        disabled={isOutOfStock}
        onPress={() => onToggle(product.id)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <ProductImage uri={product.image} accessibilityLabel={product.name} size={IMAGE_SIZE} />
        <View style={styles.info}>
          <Text style={[styles.name, isOutOfStock && styles.disabledText]} numberOfLines={2}>
            {product.name}
          </Text>
          {subtitle ? <Text style={styles.meta}>{subtitle}</Text> : null}
          <Text style={[styles.meta, isOutOfStock && styles.outOfStock]}>
            {isOutOfStock
              ? t('orders.create.products.outOfStock')
              : `${formatMoney(product.price, locale)} · ${t('orders.create.products.stock', {
                  value: formatNumber(product.stock, locale),
                })}`}
          </Text>
        </View>
        {isOutOfStock ? null : <AnimatedChevron expanded={expanded} color={colors.icon} />}
      </Pressable>

      {expanded ? (
        <View style={styles.sizes}>
          {product.variants.map((variant) => {
            // Sepette olan adet düşülür; kalan yoksa beden seçilemez
            const available = variant.quantity - (cartQuantities?.get(variant.id) ?? 0);
            const isDisabled = available <= 0;

            return (
              <Pressable
                key={variant.id}
                accessibilityRole="button"
                accessibilityLabel={t('orders.create.products.addSize', {
                  name: product.name,
                  size: variant.name,
                })}
                accessibilityState={{ disabled: isDisabled }}
                disabled={isDisabled}
                onPress={() => onPick(product, variant)}
                style={({ pressed }) => [
                  styles.size,
                  isDisabled && styles.sizeDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.sizeName, isDisabled && styles.sizeNameDisabled]}>
                  {variant.name}
                </Text>
                <Text style={styles.sizeStock}>{formatNumber(Math.max(available, 0), locale)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default memo(ProductPickerRow);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm,
      gap: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    header: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
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
    disabledText: {
      color: colors.textDisabled,
    },
    meta: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    outOfStock: {
      color: colors.error,
    },
    sizes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    size: {
      minWidth: MIN_TOUCH_SIZE,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.chipBorder,
      backgroundColor: colors.surface,
    },
    sizeDisabled: {
      backgroundColor: colors.background,
    },
    sizeName: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    sizeNameDisabled: {
      color: colors.textDisabled,
      textDecorationLine: 'line-through',
    },
    sizeStock: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
