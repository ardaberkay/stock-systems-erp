import OrderCard from '@/components/cards/OrderCard';
import OrderCardSkeleton from '@/components/skeleton/OrderCardSkeleton';
import Skeleton from '@/components/skeleton/Skeleton';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import OrderListFooter from '@/components/ui/order/OrderListFooter';
import PeriodPill from '@/components/ui/PeriodPill';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useOrderList } from '@/hooks/useOrderList';
import { useOrderLookups } from '@/hooks/useOrderLookups';
import { useOrderPeriodLabel } from '@/hooks/useOrderPeriodLabel';
import { getErrorMessageKey } from '@/lib/apiError';
import type { Order } from '@/schemas/orders';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatNumber, formatOrderDay } from '@/utils/formatter';
import { getWhatsAppUrl } from '@/utils/whatsapp';
import { router, useNavigation } from 'expo-router';
import {
  DrawerActions,
  type NavigationProp,
  type NavigationState,
  type ParamListBase,
} from 'expo-router/react-navigation';
import Menu from 'lucide-react-native/icons/menu';
import Plus from 'lucide-react-native/icons/plus';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// expo-router sekme olayının tipini dışa açmıyor; yalnızca dinlenen olay tanımlanır
type TabsNavigation = NavigationProp<
  ParamListBase,
  string,
  undefined,
  NavigationState,
  object,
  { tabPress: { data: undefined } }
>;

const SKELETON_CARD_KEYS = ['first', 'second', 'third', 'fourth'];
const FAB_SPACE = 88;
const COUNT_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;
// Liste panelin köşe yuvarlaklığı kadar altına girer; köşelerde arkadaki kartlar görünür
const HEADER_OVERLAP = RADIUS.xxl;

const getOrderKey = (order: Order) => String(order.id);

const openOrder = (orderId: number) => {
  router.push({ pathname: '/order-detail/[id]', params: { id: String(orderId) } });
};

const editOrder = (orderId: number) => {
  router.push({ pathname: '/order-edit/[id]', params: { id: String(orderId) } });
};

const openPeriodSelect = () => {
  router.push('/order-period');
};

export default function OrderScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<TabsNavigation>();
  const listRef = useRef<FlatList<Order>>(null);
  // Kısa listede onEndReached kaydırmadan da tetiklenir; "Bugün"e önceki hafta karışmasın
  const hasUserScrolled = useRef(false);
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // iOS'ta sekme çubuğu ekranın üstüne biner ve bu değere dahildir; Android'de ekran çubuğun üstünde biter
  const fabOffset = Platform.OS === 'ios' ? insets.bottom : 0;
  const [searchText, setSearchText] = useState('');
  const periodLabel = useOrderPeriodLabel();
  const {
    orders,
    lookupOrders,
    isFiltering,
    hasActiveFilters,
    isServerResult,
    isSearching,
    emptyMessageKey,
    isLoading,
    error,
    isRefreshing,
    refresh,
    oldestDay,
    canLoadMore,
    isLoadingMore,
    loadMore,
  } = useOrderList(searchText);
  const { cargos, paymentNames, customStatusNames, partners } = useOrderLookups(lookupOrders);

  // iOS'ta sekmenin kendi başa dönme davranışı kaydırma alanını bulamıyor: ilk görünüm sabit panel.
  // Başka sekmeden gelince konum korunur, yalnızca açık sekmeye tekrar basınca başa döner.
  useEffect(
    () =>
      navigation.addListener('tabPress', () => {
        if (navigation.isFocused()) {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      }),
    [navigation],
  );

  const openWhatsApp = useCallback(
    (phone: string, message: string) => {
      Linking.openURL(getWhatsAppUrl(phone, message)).catch(() => {
        Alert.alert(t('orders.whatsappError'));
      });
    },
    [t],
  );

  const renderOrder = useCallback<ListRenderItem<Order>>(
    ({ item }) => (
      <OrderCard
        order={item}
        paymentName={
          item.orderPaymentTypeId === null ? undefined : paymentNames.get(item.orderPaymentTypeId)
        }
        cargo={
          item.shippingCargoCompanyId === null ? undefined : cargos.get(item.shippingCargoCompanyId)
        }
        customStatusName={
          item.orderCustomStatusId === null
            ? undefined
            : customStatusNames.get(item.orderCustomStatusId)
        }
        partner={item.affiliateAccountId === null ? undefined : partners.get(item.affiliateAccountId)}
        colors={colors}
        locale={locale}
        onOpen={openOrder}
        onEdit={editOrder}
        onWhatsApp={openWhatsApp}
      />
    ),
    [paymentNames, cargos, customStatusNames, partners, colors, locale, openWhatsApp],
  );

  // Filtre veya aramada liste kısa kalır, otomatik yükleme art arda istek atardı; orada düğme var
  const loadMoreOnScroll = () => {
    if (hasUserScrolled.current && canLoadMore && !isFiltering) {
      hasUserScrolled.current = false;
      loadMore();
    }
  };

  const getCountText = () => {
    const value = formatNumber(orders.length, locale);

    if (isServerResult) {
      return t('orders.serverResultCount', { value });
    }
    return t(isFiltering ? 'orders.resultCount' : 'orders.orderCount', { value });
  };

  // Yüklenme, hata ve boş durumda da görünür; kullanıcı dönemi her zaman değiştirebilir
  const listHeader = (
    <View style={styles.listHeader}>
      <PeriodPill label={periodLabel} onPress={openPeriodSelect} compact />

      {isLoading ? (
        <Skeleton width={72} height={typography.caption.lineHeight} />
      ) : (
        <View style={styles.resultCount}>
          <ShoppingCart size={COUNT_ICON_SIZE} color={colors.icon} />
          <Text style={styles.resultCountText} numberOfLines={1}>
            {getCountText()}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Sabit üst panel: durum çubuğundan başlar, liste alt köşelerinin arkasından akar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('drawer.open')}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.iconButton}
          >
            <Menu size={ICON_SIZE.lg} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>{t('tabs.order')}</Text>

          <View style={styles.iconButton} />
        </View>

        <View style={styles.searchRow}>
          <SearchFilterBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('orders.searchPlaceholder')}
            filterLabel={t('orders.filterTitle')}
            isFilterActive={hasActiveFilters}
            onFilterPress={() => router.push('/order-filters')}
          />
        </View>
      </View>

      {error && orders.length === 0 ? (
        <View style={styles.list}>
          {listHeader}
          <StateMessage message={t(getErrorMessageKey(error))} onRetry={refresh} />
        </View>
      ) : isLoading ? (
        <View style={styles.list}>
          {listHeader}

          {SKELETON_CARD_KEYS.map((key) => (
            <OrderCardSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={orders}
          keyExtractor={getOrderKey}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          onScrollBeginDrag={() => {
            hasUserScrolled.current = true;
          }}
          onEndReached={loadMoreOnScroll}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.orange}
              progressViewOffset={HEADER_OVERLAP}
            />
          }
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <StateMessage message={t(isSearching ? 'orders.searching' : emptyMessageKey)} />
          }
          ListFooterComponent={
            canLoadMore ? (
              <OrderListFooter
                loadedUntil={formatOrderDay(oldestDay)}
                isLoading={isLoadingMore}
                onLoadMore={loadMore}
              />
            ) : undefined
          }
        />
      )}

      <FloatingActionButton
        icon={Plus}
        accessibilityLabel={t('orders.addOrder')}
        onPress={() => router.push('/order-new')}
        bottomOffset={fabOffset}
      />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      zIndex: 1,
      marginBottom: -HEADER_OVERLAP,
      paddingBottom: SPACING.sm,
      borderBottomLeftRadius: RADIUS.xl,
      borderBottomRightRadius: RADIUS.xl,
      backgroundColor: colors.background,
    },
    topBar: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: SPACING.xl,
    },
    iconButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...typography.h3,
      color: colors.text,
      fontFamily: FONT_FAMILY.bold,
    },
    searchRow: {
      marginHorizontal: SPACING.xl,
    },
    // Liste kenar boşluğuna eklenince yatayda arama satırıyla hizalanır
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      marginHorizontal: SPACING.sm,
    },
    resultCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 0,
    },
    resultCountText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    list: {
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingTop: HEADER_OVERLAP + SPACING.xs,
      // Son kart ekleme butonunun altında kalmasın; sekme çubuğu boşluğunu iOS kendisi ekler
      paddingBottom: FAB_SPACE,
    },
  });
}
