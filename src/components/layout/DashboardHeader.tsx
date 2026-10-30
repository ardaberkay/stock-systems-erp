import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT, typography } from '@/theme/typography';
import { ICON_SIZE, SPACING } from '@/theme/spacing';
import { formatMoney } from '@/utils/formatter';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DashboardHeaderProps = {
  colors: AppColors;
  totalRevenue: number;
  multiplier: number;
  showSold: boolean;
  showOrders: boolean;
  onToggleSold: () => void;
  onToggleOrders: () => void;
  locale: string;
  // Ciro satırının solunda gösterilen dönem filtresi
  periodFilter: ReactNode;
};

export default function DashboardHeader({
  colors,
  totalRevenue,
  multiplier,
  showSold,
  showOrders,
  onToggleSold,
  onToggleOrders,
  locale,
  periodFilter,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  const changeLabel = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(0.128);

  const styles = createStyles(colors);

  return (
    <View style={styles.revenueSection}>
      {/* Solda dönem filtresi, sağda önceki döneme göre değişim */}
      <View style={styles.revenueHeader}>
        {periodFilter}

        <View style={styles.changeBadge}>
          <TrendingUp size={ICON_SIZE.sm} color={colors.success} />
          <Text style={styles.changeText}>{changeLabel}</Text>
        </View>
      </View>

      {/* "Toplam satış" yazısı yok; ekran okuyucu için etiket olarak verilir */}
      <Text
        accessibilityLabel={`${t('dashboard.totalSales')}: ${formatMoney(totalRevenue, locale)}`}
        style={styles.revenueAmount}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatMoney(totalRevenue, locale)}
      </Text>

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

          <Text style={styles.metricValue}>
            {Math.round(342 * multiplier).toLocaleString(locale)}
          </Text>
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

          <Text style={styles.metricValue}>
            {Math.round(186 * multiplier).toLocaleString(locale)}
          </Text>
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
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xxs,
      backgroundColor: colors.successBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 7,
    },
    changeText: {
      ...typography.caption,
      color: colors.success,
      fontSize: FONT_SIZE.xs,
      fontFamily: FONT_FAMILY.bold,
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