import PeriodPill from '@/components/ui/PeriodPill';
import StateMessage from '@/components/ui/StateMessage';
import { getAffiliateTitle } from '@/features/affiliates/affiliateList';
import type { AffiliateSalesMetric } from '@/features/affiliates/affiliateSales';
import { useAffiliates } from '@/features/affiliates/api/affiliates';
import AffiliateMetricSelector from '@/features/affiliates/components/AffiliateMetricSelector';
import AffiliateReportTabs from '@/features/affiliates/components/AffiliateReportTabs';
import AffiliateSalesChart from '@/features/affiliates/components/AffiliateSalesChart';
import AffiliateTopProducts from '@/features/affiliates/components/AffiliateTopProducts';
import { useAffiliateSalesReport } from '@/features/affiliates/useAffiliateSalesReport';
import OrderCardSkeleton from '@/features/orders/components/OrderCardSkeleton';
import { useOrderLookups } from '@/features/orders/hooks/useOrderLookups';
import type { Order } from '@/features/orders/schemas/orders';
import { usePeriodLabel } from '@/features/period/usePeriodLabel';
import ReportOrderCard from '@/features/reports/components/ReportOrderCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REPORT_TABS = ['report', 'orders'] as const;
type ReportTab = (typeof REPORT_TABS)[number];

// Listenin satırları: sekme satırı, rapor bloğu ya da sipariş kartları
type ReportRow =
  | { kind: 'tabs' }
  | { kind: 'report' }
  | { kind: 'ordersState' }
  | { kind: 'order'; order: Order };

const ORDER_SKELETON_KEYS = ['first', 'second', 'third'];
// Sekme satırı (sağında dönem) ilk satırdır ve kaydırınca üstte kalır
const STICKY_TAB_INDICES = [0];

function getRowKey(row: ReportRow) {
  return row.kind === 'order' ? `order-${row.order.id}` : row.kind;
}

// Ortağın satış raporu (affiliate-orders/[id]). Üstte Rapor / Siparişler sekmeleri ve aynı
// satırda dönem; dönem iki sekmede ortaktır. Kart çerçevesi yok: bölümler boşluk ve
// başlıkla ayrılır.
export default function AffiliateOrdersScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selection,
    window,
    orders,
    revenue,
    chartPoints,
    soldTotal,
    topProducts,
    productsById,
    isProductsLoading,
    hasData,
    isPending,
    error,
    refetch,
  } = useAffiliateSalesReport(Number(id));
  // Başlık ortağın butik adı (yoksa ad soyad); ortak listesi detaydan gelirken önbellekte
  const affiliate = useAffiliates().data?.find((item) => item.id === Number(id));
  const title = affiliate ? getAffiliateTitle(affiliate) : '';
  const lookups = useOrderLookups(orders);
  const periodLabel = usePeriodLabel(selection);
  const [activeTab, setActiveTab] = useState<ReportTab>('report');
  const [metric, setMetric] = useState<AffiliateSalesMetric>('revenue');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasError = Boolean(error) && !hasData;

  const rows = useMemo<ReportRow[]>(() => {
    if (activeTab === 'report') {
      return [{ kind: 'tabs' }, { kind: 'report' }];
    }
    return [
      { kind: 'tabs' },
      ...(hasData && orders.length > 0
        ? orders.map((order): ReportRow => ({ kind: 'order', order }))
        : [{ kind: 'ordersState' } as const]),
    ];
  }, [activeTab, hasData, orders]);

  // Sessiz yenilemede gösterge dönmesin; yalnızca kullanıcı aşağı çekince görünür
  const refresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const errorMessage = hasError ? (
    <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />
  ) : null;

  const renderRow: ListRenderItem<ReportRow> = ({ item }) => {
    switch (item.kind) {
      case 'tabs':
        return (
          <View style={styles.tabBar}>
            <AffiliateReportTabs
              options={REPORT_TABS.map((tab) => ({
                value: tab,
                label: t(`affiliates.detail.reportTabs.${tab}`),
              }))}
              value={activeTab}
              onChange={setActiveTab}
              trailing={
                <PeriodPill
                  compact
                  label={periodLabel}
                  onPress={() =>
                    router.push({ pathname: '/period/[scope]', params: { scope: 'affiliates' } })
                  }
                />
              }
              colors={colors}
            />
          </View>
        );
      case 'report':
        return (
          errorMessage ?? (
            <View style={styles.report}>
              <View style={styles.metricBlock}>
                <AffiliateMetricSelector
                  values={{ revenue, orders: orders.length, sold: soldTotal }}
                  selected={metric}
                  onSelect={setMetric}
                  isLoading={!hasData}
                  colors={colors}
                  locale={locale}
                />
                <AffiliateSalesChart
                  points={chartPoints}
                  granularity={window.granularity}
                  metric={metric}
                  isLoading={!hasData}
                  colors={colors}
                  locale={locale}
                />
              </View>
              <AffiliateTopProducts
                items={topProducts}
                productsById={productsById}
                isLoading={isProductsLoading}
                colors={colors}
                locale={locale}
              />
            </View>
          )
        );
      case 'ordersState':
        if (errorMessage) {
          return errorMessage;
        }
        if (isPending) {
          return (
            <View style={styles.skeletons}>
              {ORDER_SKELETON_KEYS.map((key) => (
                <OrderCardSkeleton key={key} />
              ))}
            </View>
          );
        }
        return <StateMessage message={t('affiliates.detail.ordersEmpty')} />;
      case 'order':
        return (
          <ReportOrderCard order={item.order} lookups={lookups} colors={colors} locale={locale} />
        );
    }
  };

  return (
    <>
      {title ? <Stack.Screen options={{ title }} /> : null}
      <FlatList
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: SPACING.xxl + insets.bottom }]}
        data={rows}
        keyExtractor={getRowKey}
        renderItem={renderRow}
        stickyHeaderIndices={STICKY_TAB_INDICES}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.orangeWhite}
            colors={[colors.orangeWhite]}
            progressBackgroundColor={colors.surface}
          />
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
      ...SCREEN_CONTENT,
      gap: SPACING.sm,
      paddingHorizontal: SPACING.xl,
    },
    // Yapışık kalınca altından geçen içerik görünmesin diye zemin rengi verilir
    tabBar: {
      paddingTop: SPACING.xs,
      paddingBottom: SPACING.sm,
      backgroundColor: colors.background,
    },
    report: {
      gap: SPACING.xxl,
      paddingTop: SPACING.sm,
    },
    metricBlock: {
      gap: SPACING.lg,
    },
    skeletons: {
      gap: SPACING.sm,
    },
  });
}
