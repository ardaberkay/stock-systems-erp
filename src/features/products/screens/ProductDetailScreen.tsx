import SegmentedControl from '@/components/ui/SegmentedControl';
import Skeleton from '@/components/ui/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import { useProduct } from '@/features/products/api/products';
import ProductDetailHeader from '@/features/products/components/detail/ProductDetailHeader';
import ProductInfoTab from '@/features/products/components/detail/ProductInfoTab';
import ProductPriceTab from '@/features/products/components/detail/ProductPriceTab';
import ProductVariantsTab from '@/features/products/components/detail/ProductVariantsTab';
import ProductEditView from '@/features/products/components/edit/ProductEditView';
import { PRODUCT_DETAIL_TABS, type ProductDetailTab } from '@/features/products/constants/productEdit';
import { useProductSalesStore } from '@/features/products/stores/productSalesStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useKeptScroll } from '@/hooks/useKeptScroll';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// İskelet blokları gerçek bölümlerin kabaca yüksekliğinde; içerik gelince sayfa zıplamasın
const SKELETON_BLOCK_HEIGHTS = [120, 240, 200];

// Ürün detayı; panelde olduğu gibi düzenleme de bu sayfadadır. Kartlardaki "Düzenle" ve
// sipariş detayındaki ürün satırları buraya açılır.
export default function ProductDetailScreen() {
  const { t } = useTranslation();
  // Düzenleme modu sayfa parametresidir: başlıktaki kalem ve karttaki "Düzenle" edit=1 yapar
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const productId = Number(id);
  const isEditing = edit === '1';
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Gösterge yalnızca kullanıcı aşağı çekince döner; açılıştaki arka plan güncellemesi sessizdir
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Sayfa her açılışta Bilgi bölümüyle başlar
  const [activeTab, setActiveTab] = useState<ProductDetailTab>('info');
  // Açılan bölüm sonra gizlenir ama kaldırılmaz: Bilgi'ye dönünce grafik çizilme animasyonunu
  // baştan oynatmasın (düzenleme halindeki gibi)
  const [visitedTabs, setVisitedTabs] = useState<ProductDetailTab[]>([activeTab]);
  if (!visitedTabs.includes(activeTab)) {
    setVisitedTabs([...visitedTabs, activeTab]);
  }
  const { data: product, isPending, error, refetch } = useProduct(productId);
  const resetSalesPeriod = useProductSalesStore((state) => state.reset);
  // Okuma ve düzenleme hali aynı kaydırma konumunu paylaşır: Düzenle'ye basınca ya da
  // düzenlemeden çıkınca sayfa başa dönmez
  const scrollPosition = useRef(0);
  const keptScroll = useKeptScroll(scrollPosition);

  // Grafik her açılışta Son 7 gün ile başlar; bu ürünün dönemi sonra açılan ürüne taşınmaz
  useEffect(() => resetSalesPeriod, [resetSalesPeriod]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Başlıktaki kalem rota tanımında (src/app/_layout.tsx); sayfa başlığa hiçbir şey eklemez.
  // App bar mor olduğu için durum çubuğu iki temada da açık renkli.
  if (!product) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        {isPending ? (
          <View style={styles.content}>
            {SKELETON_BLOCK_HEIGHTS.map((height, index) => (
              <Skeleton key={index} width="100%" height={height} radius={RADIUS.lg} />
            ))}
          </View>
        ) : error ? (
          <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />
        ) : (
          <StateMessage message={t('stock.detail.notFound')} />
        )}
      </View>
    );
  }

  if (isEditing) {
    return (
      <>
        <StatusBar style="light" />
        <ProductEditView
          product={product}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onExit={() => router.setParams({ edit: undefined })}
          scrollPosition={scrollPosition}
        />
      </>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      {/* Mor başlık kaydırılan alanın dışında; sayfa onun altında kayar, sekmeler hep görünür */}
      <ProductDetailHeader product={product}>
        <SegmentedControl
          options={PRODUCT_DETAIL_TABS.map((tab) => ({
            value: tab,
            label: t(`stock.detail.tabs.${tab}`),
          }))}
          value={activeTab}
          onChange={setActiveTab}
          onColor={colors.productHeaderStart}
        />
      </ProductDetailHeader>

      <ScrollView
        {...keptScroll}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.orange}
            colors={[colors.orange]}
          />
        }
      >
        {PRODUCT_DETAIL_TABS.filter((tab) => visitedTabs.includes(tab)).map((tab) => (
          <View key={tab} style={[styles.tabContent, tab !== activeTab && styles.hidden]}>
            {tab === 'info' ? <ProductInfoTab product={product} /> : null}
            {tab === 'price' ? <ProductPriceTab product={product} /> : null}
            {tab === 'variants' ? <ProductVariantsTab product={product} /> : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Mor başlık ekranın tamamını kaplasın diye kök tam genişlik; tablette ortalanan yalnızca içerik
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    // Yan boşluk raporlardaki kartlar gibi SPACING.md (AGENTS.md'deki istisna)
    content: {
      ...SCREEN_CONTENT,
      gap: SPACING.xl,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.xl,
    },
    // Bölümler arası boşluk, sayfanın içerik boşluğuyla aynı
    tabContent: {
      gap: SPACING.xl,
    },
    hidden: {
      display: 'none',
    },
  });
}
