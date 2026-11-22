import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { haptics } from '@/lib/haptics';
import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT, typography } from '@/theme/typography';
import { RADIUS, SPACING } from '@/theme/spacing';
import { formatMoney, formatNumber, formatPercent } from '@/utils/formatter';
import type { OrderTotals, RevenueChange } from '@/features/orders/utils/orderStats';
import TrendingDown from 'lucide-react-native/icons/trending-down';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

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
      ? formatPercent(Math.abs(change.ratio), locale, 0)
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
      {/* Solda önceki döneme göre değişim, sağda dönem filtresi (raporlar ve siparişlerle aynı).
          Rozet yokken boş yer tutulur; dönem filtresi sola kaymaz. */}
      <View style={styles.revenueHeader}>
        {change ? (
          <View
            accessible
            accessibilityLabel={`${t('dashboard.changeFromPrevious')}: ${changeLabel}`}
          >
            <Badge label={changeLabel} tone={isDown ? 'error' : 'success'} icon={ChangeIcon} />
          </View>
        ) : (
          <View />
        )}

        {periodFilter}
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

      {/* Kutu yerine altı çizgili rakamlar: kutulu hali başka sayfaya giden buton gibi
          duruyordu. Çizgi kapalıyken de gri görünür, dokunulabildiği anlaşılır; açıkken
          grafikteki çizginin rengini alır. */}
      <View style={styles.metricsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.toggleSoldLine')}
          accessibilityState={{ selected: showSold }}
          onPress={() => {
            haptics.selection();
            onToggleSold();
          }}
          style={styles.metric}
        >
          <View style={styles.metricContent}>
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

            <View style={[styles.metricUnderline, showSold && styles.metricUnderlinePurple]} />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.toggleOrdersLine')}
          accessibilityState={{ selected: showOrders }}
          onPress={() => {
            haptics.selection();
            onToggleOrders();
          }}
          style={styles.metric}
        >
          <View style={styles.metricContent}>
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

            <View style={[styles.metricUnderline, showOrders && styles.metricUnderlineGreen]} />
          </View>
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
    metricsRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      marginTop: SPACING.md,
      gap: SPACING.lg,
    },
    metric: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingTop: 5,
    },
    // İki rakam aynı genişlikte: alt çizgiler etiket uzunluğuna göre değişmez, hizalı durur.
    // Etiket uzunsa (büyük yazı) kutu genişler, metin kesilmez.
    metricContent: {
      minWidth: '70%',
      alignItems: 'center',
      gap: 4,
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
    metricUnderline: {
      alignSelf: 'stretch',
      height: SPACING.xxs,
      marginTop: SPACING.xs,
      borderRadius: RADIUS.full,
      backgroundColor: colors.border,
    },
    metricUnderlinePurple: {
      backgroundColor: colors.purple,
    },
    metricUnderlineGreen: {
      backgroundColor: colors.green,
    },
  });
}
