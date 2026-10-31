import Skeleton from '@/components/skeleton/Skeleton';
import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT, typography } from '@/theme/typography';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { formatMoney, formatNumber, formatPercent } from '@/utils/formatter';
import type { OrderTotals, RevenueChange } from '@/utils/orderStats';
import TrendingDown from 'lucide-react-native/icons/trending-down';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DashboardHeaderProps = {
  colors: AppColors;
  totals: OrderTotals | null;
  // Rakamların yerinde iskelet gösterilir
  isLoading: boolean;
  // İki dönem de 0 ise veya önceki dönem gelmediyse null; rozet gizlenir
  change: RevenueChange | null;
  showSold: boolean;
  showOrders: boolean;
  onToggleSold: () => void;
  onToggleOrders: () => void;
  locale: string;
  // Ciro satırının solunda gösterilen dönem filtresi
  periodFilter: ReactNode;
};

const EMPTY_VALUE = '—';
const REVENUE_SKELETON_HEIGHT = FONT_SIZE['5xl'] * LINE_HEIGHT.tight;

export default function DashboardHeader({
  colors,
  totals,
  isLoading,
  change,
  showSold,
  showOrders,
  onToggleSold,
  onToggleOrders,
  locale,
  periodFilter,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  const styles = useMemo(() => createStyles(colors), [colors]);
  const revenueLabel = totals ? formatMoney(totals.revenue, locale) : EMPTY_VALUE;
  const isDown = change?.kind === 'percent' && change.ratio < 0;
  const ChangeIcon = isDown ? TrendingDown : TrendingUp;
  const changeLabel =
    change?.kind === 'percent'
      ? formatPercent(Math.abs(change.ratio), locale)
      : change
        ? `+${formatMoney(change.amount, locale)}`
        : '';

  const renderValue = (value: number | undefined) =>
    isLoading ? (
      // Yükseklik metnin satır yüksekliğiyle aynı; rakam gelince alttaki içerik kaymaz
      <Skeleton width={36} height={typography.label.lineHeight} />
    ) : (
      <Text style={styles.metricValue}>
        {value === undefined ? EMPTY_VALUE : formatNumber(value, locale)}
      </Text>
    );

  return (
    <View style={styles.revenueSection}>
      {/* Solda dönem filtresi, sağda önceki döneme göre değişim */}
      <View style={styles.revenueHeader}>
        {periodFilter}

        {change && (
          <View
            accessibilityLabel={`${t('dashboard.changeFromPrevious')}: ${changeLabel}`}
            style={[styles.changeBadge, isDown && styles.changeBadgeDown]}
          >
            <ChangeIcon size={ICON_SIZE.sm} color={isDown ? colors.error : colors.success} />
            <Text style={[styles.changeText, isDown && styles.changeTextDown]}>
              {changeLabel}
            </Text>
          </View>
        )}
      </View>

      {/* "Toplam satış" yazısı yok; ekran okuyucu için etiket olarak verilir */}
      {isLoading ? (
        <View style={styles.revenueSkeleton}>
          <Skeleton width={200} height={REVENUE_SKELETON_HEIGHT} radius={RADIUS.md} />
        </View>
      ) : (
        <Text
          accessibilityLabel={`${t('dashboard.totalSales')}: ${revenueLabel}`}
          style={styles.revenueAmount}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {revenueLabel}
        </Text>
      )}

      <View style={styles.metricsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.toggleSoldLine')}
          accessibilityState={{ selected: showSold }}
          onPress={onToggleSold}
          style={[
            styles.metric,
            showSold && styles.metricActivePurple,
          ]}
        >
          <View style={styles.metricTitleRow}>
            <View
              style={[
                styles.metricDot,
                styles.metricDotPurple,
                !showSold && styles.metricDotInactive,
              ]}
            />

            <Text
              style={[
                styles.metricLabel,
                showSold && styles.metricLabelPurple,
              ]}
            >
              {t('dashboard.soldProduct')}
            </Text>
          </View>

          {renderValue(totals?.soldCount)}
        </Pressable>

        <View style={styles.metricDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.toggleOrdersLine')}
          accessibilityState={{ selected: showOrders }}
          onPress={onToggleOrders}
          style={[
            styles.metric,
            showOrders && styles.metricActiveGreen,
          ]}
        >
          <View style={styles.metricTitleRow}>
            <View
              style={[
                styles.metricDot,
                styles.metricDotGreen,
                !showOrders && styles.metricDotInactive,
              ]}
            />

            <Text
              style={[
                styles.metricLabel,
                showOrders && styles.metricLabelGreen,
              ]}
            >
              {t('dashboard.orders')}
            </Text>
          </View>

          {renderValue(totals?.orderCount)}
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    revenueSection: {
      alignItems: 'center',
      marginBottom: 8,
      paddingHorizontal: 20,
    },
    revenueHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: SPACING.sm,
    },
    revenueAmount: {
      ...typography.metric,
      alignSelf: 'center',
      color: colors.text,
      fontSize: FONT_SIZE['5xl'],
      lineHeight: FONT_SIZE['5xl'] * LINE_HEIGHT.tight,
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: -1.4,
      marginTop: SPACING.md,
    },
    revenueSkeleton: {
      marginTop: SPACING.md,
    },
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xxs,
      backgroundColor: colors.successBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 7,
    },
    changeBadgeDown: {
      backgroundColor: colors.errorBackground,
    },
    changeText: {
      ...typography.caption,
      color: colors.success,
      fontSize: FONT_SIZE.xs,
      fontFamily: FONT_FAMILY.bold,
    },
    changeTextDown: {
      color: colors.error,
    },
    metricsRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      marginTop: SPACING.md,
      gap: 8,
    },
    metric: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 5,
      paddingHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    metricActivePurple: {
      borderColor: colors.purple,
      backgroundColor: colors.purpleLight,
    },
    metricActiveGreen: {
      borderColor: colors.green,
      backgroundColor: colors.greenLight,
    },
    metricTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    metricDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    metricDotPurple: {
      backgroundColor: colors.purple,
    },
    metricDotGreen: {
      backgroundColor: colors.green,
    },
    metricDotInactive: {
      opacity: 0.45,
    },
    metricDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    metricLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.xs,
    },
    metricLabelPurple: {
      color: colors.purple,
    },
    metricLabelGreen: {
      color: colors.green,
    },
    metricValue: {
      ...typography.label,
      color: colors.text,
      fontSize: FONT_SIZE.sm,
      fontFamily: FONT_FAMILY.bold,
    },
  });
}
