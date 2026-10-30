import ProductMiniChart from '@/components/charts/ProductMiniChart';
import type { Period } from '@/constants/periods';
import type { baseProducts } from '@/mocks/dashboard';
import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { formatMoney } from '@/utils/formatter';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type TopSellingProduct = (typeof baseProducts)[number] & {
  sold: number;
  revenue: number;
};

type TopSellingCardProps = {
  product: TopSellingProduct;
  period: Period;
  colors: AppColors;
  locale: string;
  onPress: () => void;
};

export default function TopSellingCard({
  product,
  period,
  colors,
  locale,
  onPress,
}: TopSellingCardProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.productCard}
    >
      <View style={styles.productTopRow}>
        <View style={styles.productLeft}>
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImagePlaceholderText}>
              {product.name.slice(0, 1)}
            </Text>
          </View>

          <View style={styles.productInfo}>
            <Text
              style={styles.productName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {product.name}
            </Text>

            <Text style={styles.productSku}>
              {product.sku}
            </Text>

            <View style={styles.productDetails}>
              <View style={styles.productVariant}>
                <Text style={styles.productVariantText}>
                  {t('dashboard.size')} {product.size}
                </Text>
              </View>

              <View style={styles.productColor}>
                <View
                  style={[
                    styles.productColorDot,
                    { backgroundColor: product.colorHex },
                    product.colorHex.toUpperCase() === '#FFFFFF' &&
                      styles.productColorDotLight,
                  ]}
                />

                <Text
                  style={styles.productColorText}
                  numberOfLines={1}
                >
                  {product.color}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.productDivider} />

        <View style={styles.productStats}>
          <Text
            style={styles.productRevenue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatMoney(product.revenue, locale)}
          </Text>

          <View style={styles.productMetaRow}>
            <View style={styles.productMetaItem}>
              <Text
                style={styles.productUnitPrice}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatMoney(product.price, locale)}
              </Text>

              <Text style={styles.productUnitSuffix}>
                / {t('dashboard.unitCod')}
              </Text>
            </View>

            <View style={styles.productMetaItem}>
              <Text
                style={styles.productSold}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {product.sold.toLocaleString(locale)}
              </Text>

              <Text style={styles.productUnitSuffix}>
                / {t('dashboard.unitCod')}
              </Text>
            </View>
          </View>

          <ProductMiniChart
            period={period}
            sold={product.sold}
            colors={colors}
          />
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    productCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    productTopRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 8,
    },
    productLeft: {
      flex: 1.4,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },
    productImagePlaceholder: {
      width: 86,
      height: 88,
      borderRadius: 10,
      backgroundColor: colors.orangeLight,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    productImagePlaceholderText: {
      ...typography.h1,
      color: colors.orange,
      fontSize: FONT_SIZE['2xl'],
      fontFamily: FONT_FAMILY.bold,
    },
    productInfo: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: 5,
    },
    productName: {
      ...typography.label,
      color: colors.text,
      fontSize: FONT_SIZE.sm,
      fontFamily: FONT_FAMILY.bold,
      lineHeight: 16,
    },
    productSku: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.xs,
      fontStyle: 'italic',
    },
    productDetails: {
      alignItems: 'flex-start',
      gap: 5,
    },
    productVariant: {
      alignSelf: 'flex-start',
      backgroundColor: colors.orangeLight,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    productVariantText: {
      ...typography.caption,
      color: colors.orange,
      fontSize: FONT_SIZE.xs,
      fontFamily: FONT_FAMILY.semiBold,
    },
    productColor: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minWidth: 0,
      flexShrink: 1,
    },
    productColorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    productColorDotLight: {
      borderColor: colors.textDisabled,
      borderWidth: 1,
    },
    productColorText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.xs,
      flexShrink: 1,
    },
    productDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: colors.border,
    },
    productStats: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: 7,
    },
    productRevenue: {
      ...typography.h3,
      color: colors.orangeWhite,
      fontSize: FONT_SIZE.md,
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: -0.4,
      textAlign: 'right',
    },
    productMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    productMetaItem: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 3,
      minWidth: 0,
      flexShrink: 1,
    },
    productUnitPrice: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.xs,
      fontFamily: FONT_FAMILY.medium,
      flexShrink: 1,
    },
    productSold: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.xs,
      fontFamily: FONT_FAMILY.medium,
      flexShrink: 1,
    },
    productUnitSuffix: {
      fontSize: FONT_SIZE.xs - 1,
      fontStyle: 'italic',
      color: colors.textDisabled,
      flexShrink: 0,
    },
  });
}