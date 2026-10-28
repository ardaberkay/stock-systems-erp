import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { formatDateTime, formatMoney } from '@/utils/formatter';
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
  selectedDate: Date;
  customDateActive: boolean;
  multiplier: number;
  showSold: boolean;
  showOrders: boolean;
  onToggleSold: () => void;
  onToggleOrders: () => void;
  locale: string;
};

export default function DashboardHeader({
  colors,
  totalRevenue,
  selectedDate,
  customDateActive,
  multiplier,
  showSold,
  showOrders,
  onToggleSold,
  onToggleOrders,
  locale,
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
      <View style={styles.revenueHeader}>
        <Text style={styles.totalSalesLabel}>
          {customDateActive
            ? `${t('dashboard.totalSales')} · ${formatDateTime(
                selectedDate,
                locale,
              )}`
            : t('dashboard.totalSales')}
        </Text>

        <View style={styles.changeBadge}>
          <Text style={styles.changeText}>
            ↑ {changeLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.revenueAmount}>
        {formatMoney(totalRevenue, locale)}
      </Text>

      <View style={styles.metricsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Satılan ürün çizgisini aç veya kapat"
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
          accessibilityLabel="Sipariş çizgisini aç veya kapat"
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
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginTop: 20,
    },
    totalSalesLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.xs,
      fontFamily: FONT_FAMILY.medium,
    },
    revenueAmount: {
      ...typography.metric,
      alignSelf: 'center',
      color: colors.text,
      fontSize: FONT_SIZE['4xl'],
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: -1.1,
      marginTop: 4,
    },
    changeBadge: {
      position: 'absolute',
      right: 0,
      top: 0,
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
      marginTop: 10,
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