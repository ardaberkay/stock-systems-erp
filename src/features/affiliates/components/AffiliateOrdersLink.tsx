import Skeleton from '@/components/ui/Skeleton';
import Text from '@/components/ui/Text';
import type { PeriodSelection } from '@/features/period/constants';
import { usePeriodLabel } from '@/features/period/usePeriodLabel';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

type AffiliateOrdersLinkProps = {
  selection: PeriodSelection;
  orderCount: number;
  revenue: number;
  // Siparişler henüz gelmediyse özet yerine iskelet görünür
  isLoading: boolean;
  onPress: () => void;
  colors: AppColors;
  locale: string;
};

// Detaydaki tek satırlık sipariş özeti: "Son 7 gün · 12 sipariş · ₺8.450 ›". Dokununca
// ortağın siparişleri açılır; dönem seçimi ve büyük rakamlar o sayfadadır.
export default function AffiliateOrdersLink({
  selection,
  orderCount,
  revenue,
  isLoading,
  onPress,
  colors,
  locale,
}: AffiliateOrdersLinkProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const title = t('affiliates.detail.ordersLinkTitle');
  const summary = t('affiliates.detail.ordersLinkSummary', {
    period: usePeriodLabel(selection),
    count: formatNumber(orderCount, locale),
    revenue: formatMoney(revenue, locale),
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isLoading ? title : `${title}: ${summary}`}
      accessibilityHint={t('affiliates.detail.ordersOpen')}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.texts}>
        {/* Siparişler sayfasındaki sayı satırının ikonu */}
        <View style={styles.titleRow}>
          <ShoppingCart size={ICON_SIZE.sm} color={colors.icon} />
          <Text style={styles.title}>{title}</Text>
        </View>
        {isLoading ? (
          <Skeleton width="70%" height={typography.caption.lineHeight} />
        ) : (
          <Text style={styles.summary}>{summary}</Text>
        )}
      </View>
      <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Çerçeveli kalır: başka sayfaya götüren bir buton, bilgi grubu değil (karar 20.11.2026)
    row: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.card.border,
      backgroundColor: colors.card.background,
    },
    pressed: {
      borderColor: colors.textDisabled,
    },
    texts: {
      flex: 1,
      gap: SPACING.xxs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    title: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    summary: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
