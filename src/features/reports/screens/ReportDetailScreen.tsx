import ProductCard from '@/features/products/components/ProductCard';
import ReportCustomerCard from '@/features/reports/components/ReportCustomerCard';
import ReportListRow from '@/features/reports/components/ReportListRow';
import ReportOrderCard from '@/features/reports/components/ReportOrderCard';
import TopSellingCard from '@/features/dashboard/components/TopSellingCard';
import ReportChart from '@/features/reports/components/charts/ReportChart';
import Skeleton from '@/components/ui/Skeleton';
import PeriodPill from '@/components/ui/PeriodPill';
import StateMessage from '@/components/ui/StateMessage';
import UnderlineTabs from '@/components/ui/UnderlineTabs';
import {
  isReportId,
  REPORT_PATTERN_IDS,
  REPORT_PATTERN_SPANS,
  REPORT_SNAPSHOT_IDS,
  REPORT_STOCK_GROUPS,
  type ReportId,
  type ReportPatternSpan,
  type ReportStockGroup,
} from '@/features/reports/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useOrderLookups } from '@/features/orders/hooks/useOrderLookups';
import { usePeriodLabel } from '@/features/period/usePeriodLabel';
import { useReportContent, type ReportRow } from '@/features/reports/hooks/useReportContent';
import { useReportData } from '@/features/reports/hooks/useReportData';
import { useReportPattern } from '@/features/reports/hooks/useReportPattern';
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
  // Gün deseni raporları genel dönem yerine kendi iki seçeneğini kullanır
  const isPattern = REPORT_PATTERN_IDS.includes(id);
  const [patternSpan, setPatternSpan] = useState<ReportPatternSpan>('thisWeek');
  const { pattern, error: patternError } = useReportPattern(patternSpan, isPattern);
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
      ? { stats, productsById, paymentNames, isPaymentNamesLoading, partnerNames, pattern }
      : null,
    { stockGroup: id === 'stock' ? stockGroup : undefined },
  );
  const hasPeriod = !REPORT_SNAPSHOT_IDS.includes(id) && !isPattern;
  const shownError = (!stats ? error : null) ?? (isPattern && !pattern ? patternError : null);
  const hasContent = Boolean(content && stats && !content.isEmpty);

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

  // Raporun özeti (alt başlık ve küçük not). Dönemli raporlarda dönem seçiciyle aynı satırda,
  // gün deseni raporlarında grafiğin altında, stokta sayı kutularının üstünde durur.
  const summary =
    hasContent && content?.subtitle ? (
      <View style={styles.summary}>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
        {content.hint && <Text style={styles.hint}>{content.hint}</Text>}
      </View>
    ) : null;

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
            {isPattern && (
              <UnderlineTabs
                options={REPORT_PATTERN_SPANS.map((span) => ({
                  value: span,
                  label: t(`reports.patternSpans.${span}`),
                }))}
                value={patternSpan}
                onChange={setPatternSpan}
                colors={colors}
              />
            )}
            {/* Dönem seçici yüklenirken ve hata varken de görünür; kullanıcı dönemi değiştirebilir */}
            {hasPeriod && (
              <View style={styles.summaryRow}>
                {summary ?? <View style={styles.summary} />}
                <PeriodPill
                  label={periodLabel}
                  onPress={() =>
                    router.push({ pathname: '/period/[scope]', params: { scope: 'reports' } })
                  }
                />
              </View>
            )}

            {!shownError && (isLoading || (stats && !content)) && (
              <Skeleton width="100%" height={SKELETON_CHART_HEIGHT} radius={RADIUS.md} />
            )}
            {shownError && (
              <StateMessage message={t(getErrorMessageKey(shownError))} onRetry={refresh} />
            )}
            {content?.isEmpty && <StateMessage message={t('reports.empty')} />}

            {content && stats && hasContent && (
              <>
                <ReportChart
                  content={content}
                  grid={pattern?.busyGrid ?? []}
                  colors={colors}
                  interactive
                  onSelectRow={id === 'stock' ? selectStockGroup : undefined}
                  kpiHeader={!hasPeriod && !isPattern ? summary : undefined}
                />
                {isPattern && summary}
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
    header: {
      gap: SPACING.md,
      paddingBottom: SPACING.md,
    },
    // Özet solda, dönem sağda; özet uzarsa alt satıra geçer, dönem yerinde kalır
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    summary: {
      flex: 1,
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
