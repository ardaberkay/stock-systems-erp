import { useOrder } from '@/features/orders/api/orders';
import { useProductsByIds } from '@/features/products/api/products';
import OrderDetailCargoTab from '@/features/orders/components/detail/OrderDetailCargoTab';
import OrderDetailCustomerTab from '@/features/orders/components/detail/OrderDetailCustomerTab';
import OrderDetailHeader from '@/features/orders/components/detail/OrderDetailHeader';
import OrderDetailOrderTab from '@/features/orders/components/detail/OrderDetailOrderTab';
import OrderEditView from '@/features/orders/components/edit/OrderEditView';
import Skeleton from '@/components/ui/Skeleton';
import SegmentedControl from '@/components/ui/SegmentedControl';
import StateMessage from '@/components/ui/StateMessage';
import { ORDER_DETAIL_TABS, type OrderDetailTab } from '@/features/orders/constants/detail';
import { useOrderLookups } from '@/features/orders/hooks/useOrderLookups';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useKeptScroll } from '@/hooks/useKeptScroll';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// İskelet blokları gerçek bölümlerin kabaca yüksekliğinde; içerik gelince sayfa zıplamasın
const SKELETON_BLOCK_HEIGHTS = [240, 280, 200, 240];

// Sipariş detayı; düzenleme de bu sayfadadır (başlıktaki kalem veya listedeki kartın kalemi)
export default function OrderDetailScreen() {
  const { t } = useTranslation();
  // Düzenleme modu sayfa parametresidir: başlıktaki kalem ve listedeki kartın kalemi edit=1 yapar
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const orderId = Number(id);
  const isEditing = edit === '1';
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Gösterge yalnızca kullanıcı aşağı çekince döner; açılıştaki arka plan güncellemesi sessizdir
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Sayfa her açılışta Sipariş bölümüyle başlar
  const [activeTab, setActiveTab] = useState<OrderDetailTab>('order');
  // Açılan bölüm sonra gizlenir ama kaldırılmaz: geri dönünce baştan çizilmesin
  const [visitedTabs, setVisitedTabs] = useState<OrderDetailTab[]>([activeTab]);
  if (!visitedTabs.includes(activeTab)) {
    setVisitedTabs([...visitedTabs, activeTab]);
  }
  // Okuma ve düzenleme hali aynı kaydırma oranını paylaşır: mod değişince sayfa başa dönmez
  const scrollRatio = useRef(0);
  const keptScroll = useKeptScroll(scrollRatio);
  // Düzenlemede hatalı alanı olan bölümler (sekmedeki kırmızı nokta); form düzenleme görünümünde
  const [errorTabs, setErrorTabs] = useState<OrderDetailTab[]>([]);
  // Liste aynıysa önceki değer kalır; düzenleme görünümü her çizimde iletse de döngü olmaz
  const updateErrorTabs = (tabs: OrderDetailTab[]) =>
    setErrorTabs((current) =>
      current.length === tabs.length && current.every((tab) => tabs.includes(tab)) ? current : tabs,
    );

  const { data: order, isPending, error, refetch } = useOrder(orderId);
  const orders = useMemo(() => (order ? [order] : []), [order]);
  const lookups = useOrderLookups(orders);
  const productIds = useMemo(
    () => [
      ...new Set(
        (order?.items ?? []).flatMap((item) => (item.productId === null ? [] : [item.productId])),
      ),
    ],
    [order],
  );
  const { data: products, isPending: isProductsPending } = useProductsByIds(productIds);
  const productsById = useMemo(
    () => new Map((products ?? []).map((product) => [product.id, product])),
    [products],
  );

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Bir sonraki düzenleme eski hata noktalarıyla açılmasın. Kayıttan sonra sipariş yeniden
  // çekilmiş olarak gelir (bkz. useUpdateOrder); başlık yeni durumu hemen gösterir.
  const exitEditing = () => {
    setErrorTabs([]);
    router.setParams({ edit: undefined });
  };

  // Başlıktaki kalem rota tanımında (src/app/_layout.tsx); sayfa başlığa hiçbir şey eklemez.
  // App bar yeşil olduğu için durum çubuğu iki temada da açık renkli.
  if (!order) {
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
          <StateMessage message={t('orders.detail.notFound')} />
        )}
      </View>
    );
  }

  const cargo =
    order.shippingCargoCompanyId === null ? undefined : lookups.cargos.get(order.shippingCargoCompanyId);
  const partner =
    order.affiliateAccountId === null ? undefined : lookups.partners.get(order.affiliateAccountId);
  const customStatusName =
    order.orderCustomStatusId === null
      ? undefined
      : lookups.customStatusNames.get(order.orderCustomStatusId);
  const paymentName =
    order.orderPaymentTypeId === null
      ? undefined
      : lookups.paymentNames.get(order.orderPaymentTypeId);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      {/* Yeşil başlık ve sekmeler iki modda da aynı yerde, yeniden oluşmaz; moda göre yalnızca
          altındaki içerik değişir. Başlık kayıtlı durumu gösterir. */}
      <OrderDetailHeader order={order}>
        <SegmentedControl
          options={ORDER_DETAIL_TABS.map((tab) => ({
            value: tab,
            label: t(`orders.detail.tabs.${tab}`),
            marked: isEditing && errorTabs.includes(tab),
          }))}
          value={activeTab}
          onChange={setActiveTab}
          markedHint={t('orders.editMode.tabHasErrors')}
          onColor={colors.orderHeaderStart}
        />
      </OrderDetailHeader>

      {isEditing ? (
        <OrderEditView
          order={order}
          customStatusName={customStatusName}
          partnerName={partner?.name}
          productsById={productsById}
          isProductsPending={isProductsPending}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onExit={exitEditing}
          scrollRatio={scrollRatio}
          onErrorTabsChange={updateErrorTabs}
        />
      ) : (
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
          {ORDER_DETAIL_TABS.filter((tab) => visitedTabs.includes(tab)).map((tab) => (
            <View key={tab} style={[styles.tabContent, tab !== activeTab && styles.hidden]}>
              {tab === 'order' ? (
                <OrderDetailOrderTab
                  order={order}
                  productsById={productsById}
                  isProductsPending={isProductsPending}
                  paymentName={paymentName}
                  partner={partner}
                  customStatusName={customStatusName}
                />
              ) : null}
              {tab === 'customer' ? <OrderDetailCustomerTab order={order} /> : null}
              {tab === 'cargo' ? <OrderDetailCargoTab order={order} cargo={cargo} /> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Yeşil başlık ekranın tamamını kaplasın diye kök tam genişlik; tablette ortalanan yalnızca içerik
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    // Yan boşluk ürün detayı gibi SPACING.md (AGENTS.md'deki istisna)
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
