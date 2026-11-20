import SegmentedControl from '@/components/ui/SegmentedControl';
import Skeleton from '@/components/ui/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import {
  AFFILIATE_DETAIL_TABS,
  type AffiliateDetailTab,
} from '@/features/affiliates/affiliateDetail';
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
import { SOFT_SHADOW } from '@/theme/elevation';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AffiliateDetailContentProps = {
  affiliate: Affiliate;
  isEditing: boolean;
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

  return (
    <AffiliateDetailContent
      affiliate={affiliate}
      isEditing={edit === '1'}
      refetchAffiliates={refetch}
    />
  );
}

// Üstte profil, hızlı işlemler ve sipariş satırı; altında yapışık sekme çubuğu ve seçili sekme.
// İki mod aynı kaydırma alanını paylaşır: üst kısım ve sekmeler yeniden oluşmaz, yalnızca
// sekmelerin altındaki içerik değişir. Mod değişince ilk sekmeye ve sayfa başına dönülmez,
// flaş olmaz (ürün ve sipariş detayındaki davranış). İçerik kısa; FlatList gerekmez.
function AffiliateDetailContent({
  affiliate,
  isEditing,
  refetchAffiliates,
}: AffiliateDetailContentProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<AffiliateDetailTab>('general');
  // Açılan bölüm sonra gizlenir ama kaldırılmaz: geri dönünce baştan çizilmesin
  const [visitedTabs, setVisitedTabs] = useState<AffiliateDetailTab[]>([activeTab]);
  if (!visitedTabs.includes(activeTab)) {
    setVisitedTabs([...visitedTabs, activeTab]);
  }
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
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
      stickyHeaderIndices={STICKY_TAB_INDICES}
      // Düzenlemedeki form alanları için; okuma halinde etkisi yok
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      // Yenileme iki modda da hep durur: kaldırılıp eklenince kaydırma alanı ve içindeki sekme
      // çubuğu baştan oluşuyor, mod geçişinde flaş yapıyordu. Düzenlemede yenilemek formu
      // değiştirmez (form açıldığı anki halinden başlar).
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

      {isEditing ? (
        <AffiliateEditView
          affiliate={affiliate}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onExit={() => router.setParams({ edit: undefined })}
        />
      ) : (
        <View>
          {AFFILIATE_DETAIL_TABS.filter((tab) => visitedTabs.includes(tab)).map((tab) => (
            <View key={tab} style={[styles.tabContent, tab !== activeTab && styles.hidden]}>
              {tab === 'general' ? (
                <AffiliateGeneralSection affiliate={affiliate} colors={colors} locale={locale} />
              ) : null}
              {tab === 'billing' ? <AffiliateBillingSection kind="payments" /> : null}
              {tab === 'invoices' ? <AffiliateBillingSection kind="addresses" /> : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Yan boşluk ürün ve sipariş detayı gibi SPACING.md (AGENTS.md'deki istisna)
    content: {
      ...SCREEN_CONTENT,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
    },
    top: {
      gap: SPACING.lg,
    },
    // Yapışık kalınca altından geçen gruplar görünmesin diye zemin rengi verilir. Android'de
    // gölgeli gruplar (elevation) yapışık çubuğun üstüne çıkmasın diye çubuk bir kat yukarıda;
    // kendi gölgesi zemin renginde, görünmez.
    tabBar: {
      paddingTop: SPACING.xl,
      paddingBottom: SPACING.sm,
      backgroundColor: colors.background,
      zIndex: 1,
      elevation: SOFT_SHADOW.elevation + 1,
      shadowColor: colors.background,
    },
    // Gruplar arası boşluk ürün ve sipariş detayıyla aynı; sekmelerden ilk gruba sm + md = xl
    tabContent: {
      gap: SPACING.xl,
      paddingTop: SPACING.md,
    },
    hidden: {
      display: 'none',
    },
    skeleton: {
      ...SCREEN_CONTENT,
      flex: 1,
      gap: SPACING.xl,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      backgroundColor: colors.background,
    },
  });
}
