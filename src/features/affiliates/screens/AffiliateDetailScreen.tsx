import SegmentedControl from '@/components/ui/SegmentedControl';
import Skeleton from '@/components/ui/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import { useAffiliates } from '@/features/affiliates/api/affiliates';
import AffiliateBillingSection from '@/features/affiliates/components/AffiliateBillingSection';
import AffiliateGeneralSection from '@/features/affiliates/components/AffiliateGeneralSection';
import AffiliateOrdersHeader from '@/features/affiliates/components/AffiliateOrdersHeader';
import AffiliateProfileHeader from '@/features/affiliates/components/AffiliateProfileHeader';
import AffiliateEditView from '@/features/affiliates/components/edit/AffiliateEditView';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import { useAffiliateOrders } from '@/features/affiliates/useAffiliateOrders';
import OrderCardSkeleton from '@/features/orders/components/OrderCardSkeleton';
import { useOrderLookups } from '@/features/orders/hooks/useOrderLookups';
import type { Order } from '@/features/orders/schemas/orders';
import ReportOrderCard from '@/features/reports/components/ReportOrderCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AFFILIATE_DETAIL_TABS = ['general', 'billing', 'orders'] as const;
type AffiliateDetailTab = (typeof AFFILIATE_DETAIL_TABS)[number];

// Listenin satırları: sekme çubuğu, seçili sekmenin içeriği; siparişlerde her kart ayrı satır
type DetailRow =
  | { kind: 'tabs' }
  | { kind: 'general' }
  | { kind: 'billing' }
  | { kind: 'ordersHeader' }
  | { kind: 'ordersState' }
  | { kind: 'order'; order: Order };

type AffiliateDetailContentProps = {
  affiliate: Affiliate;
  refetchAffiliates: () => Promise<unknown>;
};

const SKELETON_HEADER_HEIGHT = 160;
const SKELETON_SECTION_HEIGHT = 220;
const ORDER_SKELETON_KEYS = ['first', 'second'];
// Liste başlığı (profil) 0. çocuk; sekme çubuğu ilk satır olduğu için 1. çocuk
const STICKY_TAB_INDICES = [1];

function getRowKey(row: DetailRow) {
  return row.kind === 'order' ? `order-${row.order.id}` : row.kind;
}

// Satış ortağı detayı (affiliate-detail/[id]). Ortak bilgisi ortak listesinden gelir; API tek
// ortak için ayrı alan döndürmüyor, liste zaten önbellekte.
export default function AffiliateDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Düzenleme modu sayfa parametresidir: başlıktaki kalem edit=1 yapar
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const affiliateId = Number(id);
  const { data, isPending, error, refetch } = useAffiliates();
  const affiliate = data?.find((item) => item.id === affiliateId);

  if (error && !data) {
    return <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />;
  }

  if (isPending) {
    return (
      <View style={styles.skeleton}>
        <Skeleton width="100%" height={SKELETON_HEADER_HEIGHT} radius={RADIUS.lg} />
        <Skeleton width="100%" height={SKELETON_SECTION_HEIGHT} radius={RADIUS.lg} />
      </View>
    );
  }

  if (!affiliate) {
    return <StateMessage message={t('affiliates.notFound')} />;
  }

  if (edit === '1') {
    return (
      <AffiliateEditView
        affiliate={affiliate}
        onExit={() => router.setParams({ edit: undefined })}
      />
    );
  }

  return <AffiliateDetailContent affiliate={affiliate} refetchAffiliates={refetch} />;
}

// Profil hep üstte; altında yapışık sekme çubuğu ve seçili sekme.
function AffiliateDetailContent({ affiliate, refetchAffiliates }: AffiliateDetailContentProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<AffiliateDetailTab>('general');
  const { selection, orders, revenue, hasData, isPending, error, refetch } = useAffiliateOrders(
    affiliate.id,
  );
  const lookups = useOrderLookups(orders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rows = useMemo<DetailRow[]>(() => {
    switch (activeTab) {
      case 'general':
        return [{ kind: 'tabs' }, { kind: 'general' }];
      case 'billing':
        return [{ kind: 'tabs' }, { kind: 'billing' }];
      case 'orders':
        return [
          { kind: 'tabs' },
          { kind: 'ordersHeader' },
          ...(hasData && orders.length > 0
            ? orders.map((order): DetailRow => ({ kind: 'order', order }))
            : [{ kind: 'ordersState' } as const]),
        ];
    }
  }, [activeTab, hasData, orders]);

  // Sessiz yenilemede gösterge dönmesin; yalnızca kullanıcı aşağı çekince görünür.
  // İstekler zaten sırayla gider.
  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchAffiliates(), refetch()]);
    setIsRefreshing(false);
  };

  const renderRow: ListRenderItem<DetailRow> = ({ item }) => {
    switch (item.kind) {
      case 'tabs':
        return (
          <View style={styles.tabBar}>
            <SegmentedControl
              options={AFFILIATE_DETAIL_TABS.map((tab) => ({
                value: tab,
                label: t(`affiliates.detail.tabs.${tab}`),
              }))}
              value={activeTab}
              onChange={setActiveTab}
            />
          </View>
        );
      case 'general':
        return <AffiliateGeneralSection affiliate={affiliate} locale={locale} />;
      case 'billing':
        return <AffiliateBillingSection colors={colors} />;
      case 'ordersHeader':
        return (
          <AffiliateOrdersHeader
            selection={selection}
            orderCount={orders.length}
            revenue={revenue}
            isLoading={!hasData}
            colors={colors}
            locale={locale}
          />
        );
      case 'ordersState':
        if (error && !hasData) {
          return (
            <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />
          );
        }
        if (isPending) {
          return (
            <View style={styles.orderSkeletons}>
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
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: SPACING.xxl + insets.bottom }]}
      data={rows}
      keyExtractor={getRowKey}
      renderItem={renderRow}
      stickyHeaderIndices={STICKY_TAB_INDICES}
      ListHeaderComponent={<AffiliateProfileHeader affiliate={affiliate} colors={colors} />}
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
      paddingTop: SPACING.md,
    },
    // Yapışık kalınca altından geçen kartlar görünmesin diye zemin rengi verilir
    tabBar: {
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.sm,
      backgroundColor: colors.background,
    },
    orderSkeletons: {
      gap: SPACING.sm,
    },
    skeleton: {
      ...SCREEN_CONTENT,
      flex: 1,
      gap: SPACING.xl,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
      backgroundColor: colors.background,
    },
  });
}
