import SizeRow from '@/components/ui/SizeRow';
import { PRODUCT_STATUS, SIZES_PER_ROW } from '@/constants/products';
import type { Product } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney } from '@/utils/formatter';
import { chunkItems, toQuantityCell, toSizeCell } from '@/utils/productList';
import Award from 'lucide-react-native/icons/award';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import CircleOff from 'lucide-react-native/icons/circle-off';
import Coins from 'lucide-react-native/icons/coins';
import Folder from 'lucide-react-native/icons/folder';
import Pencil from 'lucide-react-native/icons/pencil';
import Trash from 'lucide-react-native/icons/trash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

type ProductCardDetailsProps = {
  product: Product;
  colors: AppColors;
  locale: string;
};

// Kartın perde içeriği; yalnızca kart ilk açıldığında çizilir.
export default function ProductCardDetails({ product, colors, locale }: ProductCardDetailsProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const showComingSoon = () => Alert.alert(t('common.comingSoon'));

  return (
    <View style={styles.container}>
      {firstRow.length > 0 && (
        <SizeRow
          cells={firstRow.map((variant) => toQuantityCell(variant, locale))}
          variant="quantity"
        />
      )}

      {otherRows.map((row) => (
        <View key={row[0].id}>
          <SizeRow cells={row.map(toSizeCell)} variant="size" />
          <SizeRow
            cells={row.map((variant) => toQuantityCell(variant, locale))}
            variant="quantity"
          />
        </View>
      ))}

      <View style={styles.details}>
        {details.map(({ key, icon: Icon, label, value }) => (
          <View key={key} style={styles.detail}>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('stock.edit')}
          onPress={showComingSoon}
          style={[styles.actionButton, styles.editButton]}
        >
          <Pencil size={ICON_SIZE.sm} color={colors.text} />
          <Text style={styles.editText}>{t('stock.edit')}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('stock.delete')}
          onPress={showComingSoon}
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Trash size={ICON_SIZE.sm} color={colors.error} />
          <Text style={styles.deleteText}>{t('stock.delete')}</Text>
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
      gap: SPACING.xs,
    },
    // İki sütun: satırda tek kalan bilgi tüm genişliği alır
    detail: {
      flexBasis: '48%',
      flexGrow: 1,
      gap: SPACING.xxs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.background,
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
    editButton: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteButton: {
      backgroundColor: colors.errorBackground,
    },
    editText: {
      ...typography.label,
      color: colors.text,
      fontFamily: FONT_FAMILY.semiBold,
    },
    deleteText: {
      ...typography.label,
      color: colors.error,
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}
