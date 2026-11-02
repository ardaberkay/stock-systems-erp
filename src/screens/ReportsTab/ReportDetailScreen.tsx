import ProductCard from '@/components/cards/ProductCard';
import ReportListRow from '@/components/cards/ReportListRow';
import ReportOrderCard from '@/components/cards/ReportOrderCard';
import TopSellingCard from '@/components/cards/TopSellingCard';
import ReportChart from '@/components/charts/ReportChart';
import Skeleton from '@/components/skeleton/Skeleton';
import FilterChip from '@/components/ui/FilterChip';
import PeriodPill from '@/components/ui/PeriodPill';
import StateMessage from '@/components/ui/StateMessage';
import { isReportId, type ReportId } from '@/constants/reports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useOrderLookups } from '@/hooks/useOrderLookups';
import { usePeriodLabel } from '@/hooks/usePeriodLabel';
import {
  useReportContent,
  type ReportProductSort,
  type ReportRow,
} from '@/hooks/useReportContent';
import { useReportData } from '@/hooks/useReportData';
import { getErrorMessageKey } from '@/lib/apiError';
import { useReportFilterStore } from '@/stores/reportFilterStore';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SKELETON_CHART_HEIGHT = 220;

function openCustomer(row: ReportRow) {
  if (row.customer) {
    router.push({ pathname: '/report-customer/[phone]', params: row.customer });
  }
}

export default function ReportDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!isReportId(id)) {
    return <StateMessage message={t('reports.empty')} />;
  }

  return <ReportDetail id={id} />;
}

function ReportDetail({ id }: { id: ReportId }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selection = useReportFilterStore((state) => state.selection);
  const periodLabel = usePeriodLabel(selection);
  const {
    stats,
    productsById,
    paymentNames,
    isPaymentNamesLoading,
    isLoading,
    error,
    isRefreshing,
    refresh,
  } = useReportData(selection);
  const locale = useLocale();
  const [productSort, setProductSort] = useState<ReportProductSort>('sold');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Kargo ve ödeme adları yalnızca sipariş kartı çizilen raporda istenir
  const reportOrders = useMemo(
    () => (id === 'returns' ? (stats?.returns.orders ?? []) : []),
    [id, stats],
  );
  const lookups = useOrderLookups(reportOrders);
  const content = useReportContent(
    id,
    stats ? { stats, productsById, paymentNames, isPaymentNamesLoading } : null,
    productSort,
  );

  const toggleProduct = useCallback((productId: number) => {
    setExpandedId((current) => (current === productId ? null : productId));
  }, []);

  const renderRow = useCallback(
    ({ item }: { item: ReportRow }) => {
      if (item.bestSeller) {
        return (
          <View style={styles.listCard}>
            <TopSellingCard
              item={item.bestSeller}
              product={productsById.get(item.bestSeller.productId)}
              colors={colors}
              locale={locale}
            />
          </View>
        );
      }

      if (item.product) {
        return (
          <View style={styles.listCard}>
            <ProductCard
              product={item.product}
              isExpanded={item.product.id === expandedId}
              onToggle={toggleProduct}
              colors={colors}
              locale={locale}
            />
          </View>
        );
      }

      if (item.order) {
        return (
          <View style={styles.listCard}>
            <ReportOrderCard
              order={item.order}
              lookups={lookups}
              colors={colors}
              locale={locale}
            />
          </View>
        );
      }

      return (
        <ReportListRow
          row={item}
          colors={colors}
          onPress={item.customer ? openCustomer : undefined}
        />
      );
    },
    [colors, locale, productsById, styles, expandedId, toggleProduct, lookups],
  );

  return (
    <>
      <Stack.Screen options={{ title: t(`reports.${id}.title`) }} />
      <FlatList
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        data={content && !content.isEmpty ? content.rows : []}
        keyExtractor={(row) => row.key}
        renderItem={renderRow}
        extraData={expandedId}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.orangeWhite}
            colors={[colors.orangeWhite]}
            progressBackgroundColor={colors.surface}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.period}>
              <PeriodPill label={periodLabel} onPress={() => router.push('/report-period')} />
            </View>

            {id === 'topProducts' && (
              <View accessibilityRole="radiogroup" style={styles.sortChips}>
                <FilterChip
                  label={t('reports.sortSold')}
                  active={productSort === 'sold'}
                  onPress={() => setProductSort('sold')}
                />
                <FilterChip
                  label={t('reports.sortRevenue')}
                  active={productSort === 'revenue'}
                  onPress={() => setProductSort('revenue')}
                />
              </View>
            )}

            {(isLoading || (stats && !content)) && (
              <Skeleton width="100%" height={SKELETON_CHART_HEIGHT} radius={RADIUS.md} />
            )}
            {error && !stats && (
              <StateMessage message={t(getErrorMessageKey(error))} onRetry={refresh} />
            )}
            {content?.isEmpty && <StateMessage message={t('reports.empty')} />}

            {content && stats && !content.isEmpty && (
              <>
                {content.subtitle && <Text style={styles.subtitle}>{content.subtitle}</Text>}
                <ReportChart
                  content={content}
                  grid={stats.busyGrid}
                  colors={colors}
                  interactive
                />
                {content.note && <Text style={styles.note}>{content.note}</Text>}
              </>
            )}
          </View>
        }
      />
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: SPACING.md,
    },
    listCard: {
      paddingBottom: SPACING.sm,
    },
    sortChips: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    header: {
      gap: SPACING.md,
      paddingBottom: SPACING.md,
    },
    period: {
      alignItems: 'flex-start',
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    note: {
      ...typography.caption,
      color: colors.orange,
    },
  });
}
