import Text from '@/components/ui/Text';
import ProductColor from '@/features/products/components/ProductColor';
import SizeRow from '@/features/products/components/SizeRow';
import { PRODUCT_STATUS, SIZES_PER_ROW } from '@/features/products/constants/products';
import type { Product } from '@/features/products/schemas/products';
import { chunkItems, toQuantityCell, toSizeCell } from '@/features/products/utils/productList';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import Package from 'lucide-react-native/icons/package';
// Tag başka ekranlarda satılan ürün adedi anlamında; tür için ayrı ikon
import Shapes from 'lucide-react-native/icons/shapes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type ProductDetailHeaderProps = {
  product: Product;
};

// Detay sayfasının bölümden bağımsız özeti; kayıtlı hali gösterir, düzenlemede de değişmez.
// Bedenler ürün kartının açık halindeki gibi: üstte beden, altında adet, tükenen soluk.
export default function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPassive = product.status === PRODUCT_STATUS.passive;
  const stockColor = product.stock <= 0 ? colors.error : colors.textSecondary;
  const sizeRows = chunkItems(product.variants, SIZES_PER_ROW);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.spacedRow}>
          <Text style={styles.modelCode} selectable>
            {product.modelCode}
          </Text>
          {isPassive ? (
            <View style={styles.passiveBadge}>
              <Text style={styles.passiveText}>{t('stock.statusFilter.passive')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.spacedRow}>
          <ProductColor colorName={product.colorName} />
          {product.typeName ? (
            <View
              accessible
              accessibilityLabel={`${t('stock.type')}: ${product.typeName}`}
              style={styles.type}
            >
              <Shapes size={ICON_SIZE.sm - SPACING.xxs} color={colors.icon} />
              <Text style={styles.typeText} numberOfLines={1}>
                {product.typeName}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.spacedRow, styles.divided]}>
        <View
          accessible
          accessibilityLabel={t('stock.stockValue', { value: formatNumber(product.stock, locale) })}
          style={styles.stock}
        >
          <Package size={ICON_SIZE.sm} color={stockColor} />
          <Text style={[styles.stockText, { color: stockColor }]}>
            {formatNumber(product.stock, locale)}
          </Text>
        </View>
        <Text style={styles.price}>{formatMoney(product.price, locale)}</Text>
      </View>

      {sizeRows.length > 0 ? (
        <View style={[styles.sizes, styles.divided]}>
          {sizeRows.map((row) => (
            <View key={row[0].id}>
              <SizeRow cells={row.map((variant) => toSizeCell(variant))} variant="size" />
              <SizeRow cells={row.map((variant) => toQuantityCell(variant, locale))} variant="quantity" />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.md,
    },
    top: {
      gap: SPACING.sm,
    },
    name: {
      ...typography.body,
      fontFamily: FONT_FAMILY.bold,
      color: colors.text,
    },
    modelCode: {
      ...typography.caption,
      flexShrink: 1,
      fontFamily: FONT_FAMILY.italic,
      color: colors.textSecondary,
    },
    type: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
      minWidth: 0,
    },
    typeText: {
      ...typography.caption,
      flexShrink: 1,
      color: colors.textSecondary,
    },
    passiveBadge: {
      flexShrink: 0,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    passiveText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.semiBold,
    },
    spacedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      minWidth: 0,
    },
    // Bölümler ince çizgiyle ayrılır; kart tek blok gibi durmaz
    divided: {
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    stock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
    },
    stockText: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
    },
    price: {
      ...typography.label,
      color: colors.orangeWhite,
      fontSize: FONT_SIZE.md,
      fontFamily: FONT_FAMILY.bold,
      flexShrink: 0,
    },
    sizes: {
      gap: SPACING.xs,
    },
  });
}
