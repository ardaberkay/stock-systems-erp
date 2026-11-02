import TopSellingCard from '@/components/cards/TopSellingCard';
import RevenueLineChart from '@/components/charts/RevenueLineChart';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PeriodFilter from '@/components/filters/PeriodFilter';
import TopSellingCardSkeleton from '@/components/skeleton/TopSellingCardSkeleton';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLocale } from '@/hooks/useLocale';
import { usePeriodLabel } from '@/hooks/usePeriodLabel';
import { useTabBarInset } from '@/hooks/useTabBarInset';
import { getErrorMessageKey } from '@/lib/apiError';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { useNavigation } from 'expo-router';
import {
  DrawerActions,
  type NavigationProp,
  type NavigationState,
  type ParamListBase,
} from 'expo-router/react-navigation';
import Bell from 'lucide-react-native/icons/bell';
import Menu from 'lucide-react-native/icons/menu';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
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

const SKELETON_CARD_KEYS = ['first', 'second', 'third'];

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<TabsNavigation>();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const locale = useLocale();
  const selection = useDashboardFilterStore((state) => state.selection);
  const periodLabel = usePeriodLabel(selection);
  const {
    window,
    stats,
    productsById,
    isLoading,
    error,
    isRefreshing,
    refresh,
  } = useDashboardData();
  const [notifications, setNotifications] = useState(3);
  const [showSold, setShowSold] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);
  const bottomSpace = useTabBarInset() + SPACING.xl;

  // Appbar sabit olunca iOS'ta sekmenin kendi başa dönme davranışı kaydırma alanını bulamaz.
  // Başka sekmeden gelince konum korunur, yalnızca açık sekmeye tekrar basınca başa döner.
  useEffect(
    () =>
      navigation.addListener('tabPress', () => {
        if (navigation.isFocused()) {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
      }),
    [navigation],
  );

  return (
    // SafeAreaView boşluğu sonradan uygular ve iOS sekmelerinin otomatik boşluğuyla çakışır;
    // üst boşluk ilk karede verilir ki açılışta appbar ve sayfa aşağı kaymasın.
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Appbar: menü, logo ve bildirimler */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('drawer.open')}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconButton}
        >
          <Menu size={ICON_SIZE.lg} color={colors.text} />
        </Pressable>

        {/* Marka adı çevrilmez; "<butik" ve "." her temada turuncu ve bir tık incedir */}
        <Text accessibilityLabel="butiksistem" style={styles.logo}>
          <Text style={styles.logoAccent}>{'<butik'}</Text>
          sistem
          <Text style={styles.logoAccent}>.</Text>
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.notifications')}
          onPress={() => setNotifications(0)}
          style={styles.iconButton}
        >
          <Bell size={ICON_SIZE.lg} color={colors.text} />

          {notifications > 0 && (
            <View style={styles.notificationDot} />
          )}
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        showsVerticalScrollIndicator={false}
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
        {/* Toplam ciro, tüm dashboard'u etkileyen dönem filtresi ve metrikler */}
        <DashboardHeader
          periodFilter={<PeriodFilter />}
          colors={colors}
          totals={stats?.totals ?? null}
          isLoading={isLoading}
          change={stats?.change ?? null}
          showSold={showSold}
          showOrders={showOrders}
          onToggleSold={() =>
            setShowSold((previous) => !previous)
          }
          onToggleOrders={() =>
            setShowOrders((previous) => !previous)
          }
          locale={locale}
        />

        {/* Hata varsa filtre açık kalır; kullanıcı dönemi değiştirebilir veya yeniden dener */}
        {error && !stats ? (
          <StateMessage message={t(getErrorMessageKey(error))} onRetry={refresh} />
        ) : (
          <>
            {/* Ana ciro grafiği */}
            <RevenueLineChart
              points={stats?.chartPoints ?? []}
              granularity={window.granularity}
              canCompare={window.isPartial && window.granularity === 'hour'}
              isLoading={isLoading}
              showSold={showSold}
              showOrders={showOrders}
              colors={colors}
              locale={locale}
            />

            {/* Dönem başlıkta da yazar; kaydırınca filtre görünmez olur */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('dashboard.bestSellers')}</Text>
              <Text style={styles.sectionPeriod} numberOfLines={1}>
                {periodLabel}
              </Text>
            </View>

            {isLoading ? (
              <View style={styles.productList}>
                {SKELETON_CARD_KEYS.map((key) => (
                  <TopSellingCardSkeleton key={key} />
                ))}
              </View>
            ) : stats?.bestSellers.length === 0 ? (
              <StateMessage message={t('dashboard.emptyPeriod')} />
            ) : (
              <View style={styles.productList}>
                {stats?.bestSellers.map((item) => (
                  <TopSellingCard
                    key={item.productId}
                    item={item}
                    product={productsById.get(item.productId)}
                    colors={colors}
                    locale={locale}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.xs,
      marginHorizontal: 20,
    },
    logo: {
      ...typography.h2,
      color: colors.text,
      fontSize: FONT_SIZE.xl,
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: -1.2,
    },
    logoAccent: {
      color: colors.orange,
      fontFamily: FONT_FAMILY.semiBold,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notificationDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.orange,
      borderWidth: 1.5,
      borderColor: colors.background,
    },
    // Başlık, altındaki kartların kenarıyla hizalı durur
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
      marginBottom: SPACING.sm,
      marginHorizontal: SPACING.md,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      fontFamily: FONT_FAMILY.bold,
    },
    sectionPeriod: {
      ...typography.caption,
      color: colors.textSecondary,
      flexShrink: 1,
    },
    productList: {
      gap: SPACING.sm,
      marginHorizontal: SPACING.md,
    },
  });
}
