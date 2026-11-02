import OrderCard from '@/components/cards/OrderCard';
import OrderCardSkeleton from '@/components/skeleton/OrderCardSkeleton';
import Skeleton from '@/components/skeleton/Skeleton';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import PeriodPill from '@/components/ui/PeriodPill';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useOrderList } from '@/hooks/useOrderList';
import { useOrderLookups } from '@/hooks/useOrderLookups';
import { useOrderSelection } from '@/hooks/useOrderSelection';
import { usePeriodLabel } from '@/hooks/usePeriodLabel';
import { useTabBarInset } from '@/hooks/useTabBarInset';
import { getErrorMessageKey } from '@/lib/apiError';
import type { Order } from '@/schemas/orders';
import { useOrderFilterStore } from '@/stores/orderFilterStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { getWhatsAppUrl } from '@/utils/whatsapp';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import {
  DrawerActions,
  type NavigationProp,
  type NavigationState,
  type ParamListBase,
} from 'expo-router/react-navigation';
import ListChecks from 'lucide-react-native/icons/list-checks';
import Menu from 'lucide-react-native/icons/menu';
import Plus from 'lucide-react-native/icons/plus';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import X from 'lucide-react-native/icons/x';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  BackHandler,
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
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fabOffset = useTabBarInset();
  const [searchText, setSearchText] = useState('');
  const periodSelection = useOrderFilterStore((state) => state.selection);
  const periodLabel = usePeriodLabel(periodSelection);
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
  } = useOrderList(searchText);
  const { cargos, paymentNames, customStatusNames, partners } = useOrderLookups(lookupOrders);
  const { selectedIds, isSelecting, toggle, selectAll, clear } = useOrderSelection(searchText);
  const isAllSelected = orders.length > 0 && orders.every((order) => selectedIds.has(order.id));

  // Liste artık dönem değişince yeniden kurulmuyor; yeni dönem baştan görünsün
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [periodSelection]);

  // Android geri tuşu önce seçim modundan çıkarır; sheet açıkken ekran odakta olmadığı için devreye girmez
  useFocusEffect(
    useCallback(() => {
      if (!isSelecting) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        clear();
        return true;
      });

      return () => subscription.remove();
    }, [isSelecting, clear]),
  );

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
        isSelecting={isSelecting}
        isSelected={selectedIds.has(item.id)}
        onOpen={openOrder}
        onEdit={editOrder}
        onToggleSelect={toggle}
        onWhatsApp={openWhatsApp}
      />
    ),
    [
      paymentNames,
      cargos,
      customStatusNames,
      partners,
      colors,
      locale,
      isSelecting,
      selectedIds,
      toggle,
      openWhatsApp,
    ],
  );

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
        {isSelecting ? (
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('orders.closeSelection')}
              onPress={clear}
              style={styles.iconButton}
            >
              <X size={ICON_SIZE.lg} color={colors.text} />
            </Pressable>

            <Text style={styles.selectionTitle} numberOfLines={1}>
              {t('orders.selectedCount', { value: formatNumber(selectedIds.size, locale) })}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(isAllSelected ? 'orders.clearSelection' : 'orders.selectAll')}
              onPress={() =>
                isAllSelected ? clear() : selectAll(orders.map((order) => order.id))
              }
              style={styles.selectAllButton}
            >
              <Text style={styles.selectAllText}>
                {t(isAllSelected ? 'orders.clearSelection' : 'orders.selectAll')}
              </Text>
            </Pressable>
          </View>
        ) : (
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
        )}

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
          extraData={selectedIds}
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.orangeWhite}
              colors={[colors.orangeWhite]}
              progressBackgroundColor={colors.surface}
              progressViewOffset={HEADER_OVERLAP}
            />
          }
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <StateMessage message={t(isSearching ? 'orders.searching' : emptyMessageKey)} />
          }
        />
      )}

      {isSelecting ? (
        <FloatingActionButton
          icon={ListChecks}
          accessibilityLabel={t('orders.actionsTitle')}
          onPress={() =>
            router.push({
              pathname: '/order-actions',
              params: { count: String(selectedIds.size) },
            })
          }
          bottomOffset={fabOffset}
          backgroundColor={colors.blue}
          iconColor={colors.surface}
          pulseKey={isSelecting}
        />
      ) : (
        <FloatingActionButton
          icon={Plus}
          accessibilityLabel={t('orders.addOrder')}
          onPress={() => router.push('/order-new')}
          bottomOffset={fabOffset}
          pulseKey={isSelecting}
        />
      )}
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
    selectionTitle: {
      ...typography.h3,
      flex: 1,
      color: colors.text,
      fontFamily: FONT_FAMILY.bold,
    },
    selectAllButton: {
      minHeight: MIN_TOUCH_SIZE,
      justifyContent: 'center',
    },
    selectAllText: {
      ...typography.label,
      color: colors.orange,
      fontFamily: FONT_FAMILY.semiBold,
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
