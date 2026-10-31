import ProductCardDetails from '@/components/cards/ProductCardDetails';
import AnimatedChevron from '@/components/ui/AnimatedChevron';
import Collapsible from '@/components/ui/Collapsible';
import ProductColor from '@/components/ui/ProductColor';
import ProductImage from '@/components/ui/ProductImage';
import SizeRow, { type SizeCell } from '@/components/ui/SizeRow';
import { PRODUCT_STATUS, SIZES_PER_ROW } from '@/constants/products';
import type { Product } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { toSizeCell } from '@/utils/productList';
import { router } from 'expo-router';
import Package from 'lucide-react-native/icons/package';
import ZoomIn from 'lucide-react-native/icons/zoom-in';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ProductCardProps = {
  product: Product;
  isExpanded: boolean;
  onToggle: (productId: number) => void;
  colors: AppColors;
  locale: string;
};

// Yüzlerce kart aynı stili kullanır; her kartta yeniden oluşturulmasın.
const stylesByTheme = new WeakMap<AppColors, ReturnType<typeof createStyles>>();

function getStyles(colors: AppColors) {
  const cached = stylesByTheme.get(colors);

  if (cached) {
    return cached;
  }

  const styles = createStyles(colors);
  stylesByTheme.set(colors, styles);
  return styles;
}

function ProductCard({ product, isExpanded, onToggle, colors, locale }: ProductCardProps) {
  const { t } = useTranslation();
  const styles = getStyles(colors);
  const isPassive = product.status === PRODUCT_STATUS.passive;
  const isOutOfStock = product.stock <= 0;
  const stockColor = isOutOfStock ? colors.error : colors.textSecondary;
  const firstRow = product.variants.slice(0, SIZES_PER_ROW);
  const canOpenImages = isExpanded && Boolean(product.image);

  // Kapalıyken satıra sığmayan bedenler sayıyla özetlenir, açılınca kart tamamını gösterir
  const hiddenSizeCount = product.variants.length - SIZES_PER_ROW + 1;
  const sizeCells: SizeCell[] =
    !isExpanded && hiddenSizeCount > 1
      ? [
          ...firstRow.slice(0, SIZES_PER_ROW - 1).map(toSizeCell),
          { key: 'more', text: `+${hiddenSizeCount}`, isOutOfStock: false },
        ]
      : firstRow.map(toSizeCell);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={product.name}
        accessibilityHint={t('stock.toggleDetails')}
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => onToggle(product.id)}
        style={styles.summary}
      >
        <View style={styles.top}>
          {/* Kapalı kartta dokunuş karta gider; açık kartta görsel galeriyi açar */}
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={t('stock.viewImages')}
            disabled={!canOpenImages}
            onPress={() => router.push(`/product-images?id=${product.id}`)}
            style={isPassive && styles.passiveImage}
          >
            <ProductImage uri={product.image} accessibilityLabel={product.name} />

            {canOpenImages && (
              <View style={styles.imageHint}>
                <ZoomIn size={ICON_SIZE.sm - SPACING.xxs} color={colors.text} />
              </View>
            )}
          </Pressable>

          {/* İçerik ortalanır; ad tek satırsa boşluk kalmaz, görsel yüksekliği kartı sabit tutar */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                {product.name}
              </Text>
              <AnimatedChevron expanded={isExpanded} color={colors.icon} />
            </View>

            <Text style={styles.typeText} numberOfLines={1}>
              {product.modelCode && <Text style={styles.modelCode}>{product.modelCode}</Text>}
              {product.modelCode && product.typeName ? ' · ' : ''}
              {product.typeName}
            </Text>

            <View style={styles.spacedRow}>
              <ProductColor colorName={product.colorName} />

              {isPassive && (
                <View style={styles.passiveBadge}>
                  <Text style={styles.passiveText}>{t('stock.statusFilter.passive')}</Text>
                </View>
              )}
            </View>

            <View style={styles.spacedRow}>
              <View
                accessible
                accessibilityLabel={t('stock.stockValue', {
                  value: formatNumber(product.stock, locale),
                })}
                style={styles.stock}
              >
                <Package size={ICON_SIZE.sm} color={stockColor} />
                <Text style={[styles.stockText, { color: stockColor }]} numberOfLines={1}>
                  {formatNumber(product.stock, locale)}
                </Text>
              </View>

              <Text style={styles.price} numberOfLines={1}>
                {formatMoney(product.price, locale)}
              </Text>
            </View>
          </View>
        </View>

        {firstRow.length > 0 && <SizeRow cells={sizeCells} variant="size" />}
      </Pressable>

      <Collapsible expanded={isExpanded}>
        <ProductCardDetails product={product} colors={colors} locale={locale} />
      </Collapsible>
    </View>
  );
}

// Kart açılınca yalnızca değişen iki kart yeniden hesaplanır.
export default memo(ProductCard);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      padding: SPACING.md,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    summary: {
      gap: SPACING.sm,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    passiveImage: {
      opacity: 0.45,
    },
    imageHint: {
      position: 'absolute',
      right: SPACING.xs,
      bottom: SPACING.xs,
      padding: SPACING.xxs,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.surface,
    },
    info: {
      flex: 1,
      minWidth: 0,
      gap: SPACING.xs,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.xs,
    },
    name: {
      ...typography.label,
      flex: 1,
      color: colors.text,
      fontFamily: FONT_FAMILY.bold,
      lineHeight: 16,
    },
    typeText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    modelCode: {
      fontFamily: FONT_FAMILY.italic,
    },
    spacedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      minWidth: 0,
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
  });
}
