import ProductCard from '@/features/products/components/ProductCard';
import ReportCustomerCard from '@/features/reports/components/ReportCustomerCard';
import ReportListRow from '@/features/reports/components/ReportListRow';
import ReportOrderCard from '@/features/reports/components/ReportOrderCard';
import TopSellingCard from '@/features/dashboard/components/TopSellingCard';
import ReportChart from '@/features/reports/components/charts/ReportChart';
import Skeleton from '@/components/ui/Skeleton';
import FilterChip from '@/components/ui/FilterChip';
import PeriodPill from '@/components/ui/PeriodPill';
import StateMessage from '@/components/ui/StateMessage';
import {
  isReportId,
  REPORT_SNAPSHOT_IDS,
  REPORT_STOCK_GROUPS,
  type ReportId,
  type ReportStockGroup,
} from '@/features/reports/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useOrderLookups } from '@/features/orders/hooks/useOrderLookups';
import { usePeriodLabel } from '@/features/period/usePeriodLabel';
import {
  useReportContent,
  type ReportProductSort,
  type ReportRow,
} from '@/features/reports/hooks/useReportContent';
import { useReportData } from '@/features/reports/hooks/useReportData';
import { getErrorMessageKey } from '@/lib/apiError';
import { useReportFilterStore } from '@/features/reports/reportFilterStore';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
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
    partnerNames,
    isLoading,
    error,
    isRefreshing,
    refresh,
  } = useReportData(selection);
  const locale = useLocale();
  const [productSort, setProductSort] = useState<ReportProductSort>('sold');
  const [stockGroup, setStockGroup] = useState<ReportStockGroup>('out');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Kargo ve ödeme adları yalnızca sipariş kartı çizilen raporda istenir
  const reportOrders = useMemo(
    () => (id === 'returns' ? (stats?.returns.orders ?? []) : []),
    [id, stats],
  );
  const lookups = useOrderLookups(reportOrders);
  const content = useReportContent(
    id,
    stats
      ? { stats, productsById, paymentNames, isPaymentNamesLoading, partnerNames }
      : null,
    { productSort, stockGroup: id === 'stock' ? stockGroup : undefined },
  );

  const selectStockGroup = (key: string) => {
    const group = REPORT_STOCK_GROUPS.find((item) => item === key);

    if (group) {
      setStockGroup(group);
    }
  };

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

      if (item.customer) {
        return (
          <View style={styles.listCard}>
            <ReportCustomerCard row={item} colors={colors} onPress={openCustomer} />
          </View>
        );
      }

      return (
        <View style={item.gapAfter && styles.rowGap}>
          <ReportListRow row={item} colors={colors} />
        </View>
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
        // Sıralama değişince kartlar yer değiştirmek yerine yeniden çizilir; yer değiştirirken zıplıyordu
        keyExtractor={(row) => `${productSort}-${row.key}`}
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
            {!REPORT_SNAPSHOT_IDS.includes(id) && (
              <View style={styles.period}>
                <PeriodPill
                  label={periodLabel}
                  onPress={() =>
                    router.push({ pathname: '/period/[scope]', params: { scope: 'reports' } })
                  }
                />
              </View>
            )}

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
                {content.subtitle && (
                  <View>
                    <Text style={styles.subtitle}>{content.subtitle}</Text>
                    {content.hint && <Text style={styles.hint}>{content.hint}</Text>}
                  </View>
                )}
                <ReportChart
                  content={content}
                  grid={stats.busyGrid}
                  colors={colors}
                  interactive
                  onSelectRow={id === 'stock' ? selectStockGroup : undefined}
                />
                {content.note && <Text style={styles.note}>{content.note}</Text>}
                {id === 'stock' && content.rows.length === 0 && (
                  <StateMessage message={t('reports.stock.emptyGroup')} />
                )}
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
      ...SCREEN_CONTENT,
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: SPACING.md,
    },
    listCard: {
      paddingBottom: SPACING.sm,
    },
    rowGap: {
      marginBottom: SPACING.md,
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
    hint: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    note: {
      ...typography.caption,
      color: colors.orange,
    },
  });
}
