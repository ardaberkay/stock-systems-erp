import SegmentedControl from '@/components/ui/SegmentedControl';
import Skeleton from '@/components/ui/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import {
  AFFILIATE_DEFAULT_SELECTION,
  useAffiliateFilterStore,
} from '@/features/affiliates/affiliateFilterStore';
import { getAffiliateTitle } from '@/features/affiliates/affiliateList';
import { useAffiliates } from '@/features/affiliates/api/affiliates';
import AffiliateBillingSection from '@/features/affiliates/components/AffiliateBillingSection';
import AffiliateGeneralSection from '@/features/affiliates/components/AffiliateGeneralSection';
import AffiliateOrdersLink from '@/features/affiliates/components/AffiliateOrdersLink';
import AffiliateProfileHeader from '@/features/affiliates/components/AffiliateProfileHeader';
import AffiliateQuickActions from '@/features/affiliates/components/AffiliateQuickActions';
import AffiliateEditView from '@/features/affiliates/components/edit/AffiliateEditView';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import { useAffiliateOrders } from '@/features/affiliates/useAffiliateOrders';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Siparişler ayrı sayfadadır (sipariş satırı açar); sekmeler ortağın kendi kayıtlarıdır
const AFFILIATE_DETAIL_TABS = ['general', 'billing', 'invoices'] as const;
type AffiliateDetailTab = (typeof AFFILIATE_DETAIL_TABS)[number];

type AffiliateDetailContentProps = {
  affiliate: Affiliate;
  refetchAffiliates: () => Promise<unknown>;
};

const SKELETON_HEADER_HEIGHT = 160;
const SKELETON_SECTION_HEIGHT = 220;
// Üst kısım (profil, işlemler, sipariş satırı) 0. çocuk; sekme çubuğu 1. çocuk
const STICKY_TAB_INDICES = [1];

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

// Üstte profil, hızlı işlemler ve sipariş satırı; altında yapışık sekme çubuğu ve seçili sekme.
// İçerik kısa ve sabit sayıda olduğu için FlatList yerine ScrollView yeterli.
function AffiliateDetailContent({ affiliate, refetchAffiliates }: AffiliateDetailContentProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<AffiliateDetailTab>('general');
  // Satır hep son 7 günü gösterir: önbellekteki veridir, detayda dönem seçici yoktur
  const { selection, orders, revenue, hasData, refetch } = useAffiliateOrders(
    affiliate.id,
    AFFILIATE_DEFAULT_SELECTION,
  );
  const setOrdersSelection = useAffiliateFilterStore((state) => state.setSelection);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const title = getAffiliateTitle(affiliate) || t('affiliates.unnamed', { id: affiliate.id });

  // Sessiz yenilemede gösterge dönmesin; yalnızca kullanıcı aşağı çekince görünür.
  // İstekler zaten sırayla gider.
  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchAffiliates(), refetch()]);
    setIsRefreshing(false);
  };

  // Siparişler sayfası satırdaki dönemle açılır; rakamlar iki sayfada aynı görünür
  const openOrders = () => {
    setOrdersSelection(AFFILIATE_DEFAULT_SELECTION);
    router.push({ pathname: '/affiliate-orders/[id]', params: { id: String(affiliate.id) } });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: SPACING.xxl + insets.bottom }]}
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
    >
      <View style={styles.top}>
        <AffiliateProfileHeader affiliate={affiliate} colors={colors} />
        <AffiliateQuickActions
          name={title}
          phone={affiliate.phone}
          email={affiliate.email}
          greetingName={affiliate.firstName || title}
          colors={colors}
        />
        <AffiliateOrdersLink
          selection={selection}
          orderCount={orders.length}
          revenue={revenue}
          isLoading={!hasData}
          onPress={openOrders}
          colors={colors}
          locale={locale}
        />
      </View>

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

      <View style={styles.tabContent}>
        {activeTab === 'general' && (
          <AffiliateGeneralSection affiliate={affiliate} colors={colors} locale={locale} />
        )}
        {activeTab === 'billing' && <AffiliateBillingSection kind="payments" />}
        {activeTab === 'invoices' && <AffiliateBillingSection kind="addresses" />}
      </View>
    </ScrollView>
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
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
    },
    top: {
      gap: SPACING.lg,
    },
    // Yapışık kalınca altından geçen kartlar görünmesin diye zemin rengi verilir
    tabBar: {
      paddingTop: SPACING.xl,
      paddingBottom: SPACING.sm,
      backgroundColor: colors.background,
    },
    // Başlıklı kartlar arası boşluk düzenleme ekranıyla aynı
    tabContent: {
      gap: SPACING.xl,
      paddingTop: SPACING.sm,
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
