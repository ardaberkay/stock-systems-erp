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
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
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
  const { data: product, isPending, error, refetch } = useProduct(productId);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Başlıktaki kalem rota tanımında (src/app/_layout.tsx); sayfa başlığa hiçbir şey eklemez.
  if (!product) {
    return (
      <View style={styles.screen}>
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
      <ProductEditView
        product={product}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExit={() => router.setParams({ edit: undefined })}
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          tintColor={colors.orange}
          colors={[colors.orange]}
        />
      }
      // 1. çocuk bölüm seçimi; kaydırınca üstte yapışık kalır
      stickyHeaderIndices={[1]}
    >
      {/* Bölümden bağımsız hep görünen özet */}
      <View style={styles.summaryCard}>
        <ProductDetailHeader product={product} />
      </View>

      <View style={styles.tabBar}>
        <SegmentedControl
          options={PRODUCT_DETAIL_TABS.map((tab) => ({
            value: tab,
            label: t(`stock.detail.tabs.${tab}`),
          }))}
          value={activeTab}
          onChange={setActiveTab}
        />
      </View>

      {activeTab === 'info' ? <ProductInfoTab product={product} /> : null}
      {activeTab === 'price' ? <ProductPriceTab product={product} /> : null}
      {activeTab === 'variants' ? <ProductVariantsTab product={product} /> : null}
    </ScrollView>
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
      gap: SPACING.xl,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
    },
    summaryCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    // Yapışık kalınca alttan kayan kartları örtsün diye zemin rengi ve dikey boşluk taşır
    tabBar: {
      paddingVertical: SPACING.sm,
      backgroundColor: colors.background,
    },
  });
}
