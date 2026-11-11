import Text from '@/components/ui/Text';
import ColorDot from '@/features/products/components/ColorDot';
import type { CatalogItem } from '@/features/products/schemas/catalog';
import { getProductColorHex } from '@/features/products/utils/productColor';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

type CatalogItemRowProps = {
  item: CatalogItem;
  // Ürün kataloğu henüz yüklenmediyse yok; sayı yazılmaz
  productCount?: number;
  onPress: (id: number) => void;
  // Renk listesinde adın önünde renk noktası; eşleşmeyen adda yazılar hizalı kalsın diye boşluk
  showColorDot?: boolean;
  colors: AppColors;
  locale: string;
};

// Uzun listede her satır aynı stili kullanır; her satırda yeniden oluşturulmasın.
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

function CatalogItemRow({
  item,
  productCount,
  onPress,
  showColorDot = false,
  colors,
  locale,
}: CatalogItemRowProps) {
  const { t } = useTranslation();
  const styles = getStyles(colors);
  const colorHex = showColorDot ? getProductColorHex(item.name) : null;
  const countText =
    productCount === undefined
      ? undefined
      : t('stock.productCount', { value: formatNumber(productCount, locale) });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={countText ? `${item.name}, ${countText}` : item.name}
      accessibilityHint={t('stock.catalogList.editHint')}
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {showColorDot &&
        (colorHex ? (
          <ColorDot hex={colorHex} size={ICON_SIZE.sm} />
        ) : (
          <View style={styles.dotPlaceholder} />
        ))}

      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>

      {countText && <Text style={styles.count}>{countText}</Text>}

      <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
    </Pressable>
  );
}

export default memo(CatalogItemRow);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xl,
    },
    pressed: {
      backgroundColor: colors.divider,
    },
    dotPlaceholder: {
      width: ICON_SIZE.sm,
    },
    name: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
    count: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
