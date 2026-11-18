import Text from '@/components/ui/Text';
import { PRODUCT_STATUS } from '@/features/products/constants/products';
import type { Product } from '@/features/products/schemas/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { LinearGradient } from 'expo-linear-gradient';
import Package from 'lucide-react-native/icons/package';
// Tag başka ekranlarda satılan ürün adedi anlamında; tip için ayrı ikon
import Shapes from 'lucide-react-native/icons/shapes';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type ProductDetailHeaderProps = {
  product: Product;
  // En altta duran bölüm seçimi (sekmeler)
  children?: ReactNode;
};

// Alt köşelerin yuvarlaklığı; düz köşeyi denemek için 0 yapmak yeter
const HEADER_RADIUS = RADIUS.xl;
// Gradyan dikey açılır: üst kenar app bar'ın rengiyle aynı olduğu için ikisi tek parça görünür
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 0, y: 1 };
const META_SEPARATOR = ' · ';

// Ürün detayının app bar'la birleşik mor başlığı. Kayıtlı hali gösterir, düzenlemede de değişmez;
// sayfa altında kayar, başlık yerinde durur. Bedenler burada değil, kartta ve Varyantlar'da.
export default function ProductDetailHeader({ product, children }: ProductDetailHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPassive = product.status === PRODUCT_STATUS.passive;
  const isOutOfStock = product.stock <= 0;
  const meta = [product.modelCode, product.colorName].filter(Boolean).join(META_SEPARATOR);

  return (
    <LinearGradient
      colors={[colors.productHeaderStart, colors.productHeaderEnd]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          {/* Tip sağda, fiyatın tam üstünde durur */}
          <View style={styles.spacedRow}>
            <View style={styles.metaLeft}>
              <Text style={styles.meta} numberOfLines={1} selectable>
                {meta}
              </Text>
              {isPassive ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t('stock.statusFilter.passive')}</Text>
                </View>
              ) : null}
            </View>
            {product.typeName ? (
              <View
                accessible
                accessibilityLabel={`${t('stock.type')}: ${product.typeName}`}
                style={styles.type}
              >
                <Shapes size={ICON_SIZE.sm - SPACING.xxs} color={colors.onHeaderMuted} />
                <Text style={styles.meta} numberOfLines={1}>
                  {product.typeName}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.spacedRow}>
          <View
            accessible
            accessibilityLabel={t('stock.stockValue', { value: formatNumber(product.stock, locale) })}
            style={styles.stock}
          >
            <Package size={ICON_SIZE.sm} color={colors.onHeaderMuted} />
            <Text style={styles.stockText}>{formatNumber(product.stock, locale)}</Text>
            {/* Kırmızı yazı mor zeminde okunmaz; uyarı kendi zemini olan rozetle verilir */}
            {isOutOfStock ? (
              <View style={[styles.badge, styles.outOfStockBadge]}>
                <Text style={[styles.badgeText, styles.outOfStockText]}>
                  {t('stock.stockFilter.outOfStock')}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.price}>{formatMoney(product.price, locale)}</Text>
        </View>

        {children}
      </View>
    </LinearGradient>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    gradient: {
      borderBottomLeftRadius: HEADER_RADIUS,
      borderBottomRightRadius: HEADER_RADIUS,
    },
    // Tablette içerik ortalanır, mor zemin ise ekranın tamamını kaplar
    content: {
      ...SCREEN_CONTENT,
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xs,
      paddingBottom: SPACING.lg,
    },
    identity: {
      gap: SPACING.xs,
    },
    name: {
      ...typography.h3,
      color: colors.onHeader,
    },
    spacedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      minWidth: 0,
    },
    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      flexShrink: 1,
      minWidth: 0,
    },
    meta: {
      ...typography.caption,
      flexShrink: 1,
      color: colors.onHeaderMuted,
    },
    type: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
      minWidth: 0,
    },
    badge: {
      flexShrink: 0,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.onHeaderSurface,
    },
    badgeText: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.onHeader,
    },
    outOfStockBadge: {
      backgroundColor: colors.errorBackground,
    },
    outOfStockText: {
      color: colors.error,
    },
    stock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
    },
    stockText: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.onHeader,
    },
    price: {
      ...typography.h3,
      fontFamily: FONT_FAMILY.bold,
      flexShrink: 0,
      color: colors.onHeader,
    },
  });
}
