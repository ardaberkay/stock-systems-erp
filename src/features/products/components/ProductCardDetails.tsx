import SizeRow from '@/features/products/components/SizeRow';
import { PRODUCT_STATUS, SIZES_PER_ROW } from '@/features/products/constants/products';
import { useConfirmProductDelete } from '@/features/products/hooks/useConfirmProductDelete';
import type { Product } from '@/features/products/schemas/products';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney } from '@/utils/formatter';
import { chunkItems, toQuantityCell, toSizeCell } from '@/features/products/utils/productList';
import Award from 'lucide-react-native/icons/award';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import CircleOff from 'lucide-react-native/icons/circle-off';
import Coins from 'lucide-react-native/icons/coins';
import Info from 'lucide-react-native/icons/info';
import Folder from 'lucide-react-native/icons/folder';
import Trash from 'lucide-react-native/icons/trash';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

type ProductCardDetailsProps = {
  product: Product;
  colors: AppColors;
  locale: string;
  // Okutulan barkodun bedenleri; adetleri turuncu yazılır
  highlightedVariantIds?: ReadonlySet<number>;
};

// Kartın perde içeriği; yalnızca kart ilk açıldığında çizilir.
export default function ProductCardDetails({
  product,
  colors,
  locale,
  highlightedVariantIds,
}: ProductCardDetailsProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { confirmDelete, isDeleting } = useConfirmProductDelete();
  const [firstRow = [], ...otherRows] = chunkItems(product.variants, SIZES_PER_ROW);
  const isPassive = product.status === PRODUCT_STATUS.passive;

  const details = [
    {
      key: 'cost',
      icon: Coins,
      label: t('stock.cost'),
      value: formatMoney(product.costPrice, locale),
    },
    {
      key: 'status',
      icon: isPassive ? CircleOff : CircleCheck,
      label: t('stock.status'),
      value: t(isPassive ? 'stock.statusFilter.passive' : 'stock.statusFilter.active'),
    },
    { key: 'brand', icon: Award, label: t('stock.brand'), value: product.brandName },
    {
      key: 'category',
      icon: Folder,
      label: t('stock.category'),
      value: product.categories.map((item) => item.name).join(', '),
    },
  ].filter((detail) => detail.value);

  return (
    <View style={styles.container}>
      {firstRow.length > 0 && (
        <SizeRow
          cells={firstRow.map((variant) => toQuantityCell(variant, locale, highlightedVariantIds))}
          variant="quantity"
        />
      )}

      {otherRows.map((row) => (
        <View key={row[0].id}>
          <SizeRow
            cells={row.map((variant) => toSizeCell(variant, highlightedVariantIds))}
            variant="size"
          />
          <SizeRow
            cells={row.map((variant) => toQuantityCell(variant, locale, highlightedVariantIds))}
            variant="quantity"
          />
        </View>
      ))}

      {/* Bilgiler tek kutuda, aralarında çizgiyle iki sütun; satırda tek kalan tüm genişliği alır */}
      <View style={styles.details}>
        {details.map(({ key, icon: Icon, label, value }, index) => (
          <View
            key={key}
            style={[
              styles.detail,
              index % 2 === 1 && styles.detailRightColumn,
              index >= 2 && styles.detailNextRow,
              index % 2 === 0 && index === details.length - 1 && styles.detailFullWidth,
            ]}
          >
            <View style={styles.detailLabelRow}>
              <Icon size={ICON_SIZE.sm - SPACING.xxs} color={colors.icon} />
              <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {/* Karta dokunmak perdeyi açar; tüm bilgiler için detay sayfası buradan */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('stock.openDetail')}
          onPress={() =>
            router.push({
              pathname: '/product-detail/[id]',
              params: { id: String(product.id) },
            })
          }
          style={[styles.actionButton, styles.outlineButton]}
        >
          <Info size={ICON_SIZE.sm} color={colors.text} />
          <Text style={styles.actionText}>{t('stock.openDetail')}</Text>
        </Pressable>

        {/* Düzenleme detay sayfasından yapılır. Silme yalnızca ikon; istek sürerken tekrar basılamaz. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('stock.deleteProduct.button')}
          accessibilityState={{ busy: isDeleting, disabled: isDeleting }}
          disabled={isDeleting}
          onPress={() => confirmDelete(product)}
          style={styles.deleteButton}
        >
          {isDeleting ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Trash size={ICON_SIZE.md} color={colors.error} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.sm,
      paddingTop: SPACING.xxs,
    },
    details: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderRadius: RADIUS.md,
      backgroundColor: colors.background,
    },
    detail: {
      width: '50%',
      gap: SPACING.xxs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.sm,
    },
    // Ayırıcılar ekranın en ince çizgisi; kutuyu bölmeden gruplar
    detailRightColumn: {
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colors.divider,
    },
    detailNextRow: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    detailFullWidth: {
      width: '100%',
    },
    detailLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    detailLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    detailValue: {
      ...typography.label,
      color: colors.text,
      fontFamily: FONT_FAMILY.semiBold,
    },
    actions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    actionButton: {
      flex: 1,
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      borderRadius: RADIUS.md,
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteButton: {
      width: MIN_TOUCH_SIZE,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      backgroundColor: colors.errorBackground,
    },
    actionText: {
      ...typography.label,
      color: colors.text,
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}
