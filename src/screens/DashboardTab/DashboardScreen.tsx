import TopSellingCard from '@/components/cards/TopSellingCard';
import RevenueLineChart from '@/components/charts/RevenueLineChart';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PeriodFilter from '@/components/filters/PeriodFilter';
import {
  baseProducts,
  getRangeMock,
  periodMultipliers,
  revenueTotals,
} from '@/mocks/dashboard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { useNavigation } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';
import Bell from 'lucide-react-native/icons/bell';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Menu from 'lucide-react-native/icons/menu';
import Play from 'lucide-react-native/icons/play';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  // Tüm dashboard (ciro, grafik, çok satanlar) tek bir dönem filtresine bağlıdır
  const selection = useDashboardFilterStore((state) => state.selection);
  const [today] = useState(() => new Date());
  const [notifications, setNotifications] = useState(3);
  const [showSold, setShowSold] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Mock: tarih aralığında ciro ve grafik dönemi aralığın uzunluğundan türetilir
  const rangeMock =
    selection.kind === 'range' ? getRangeMock(selection.from, selection.to) : null;
  const period = selection.kind === 'preset' ? selection.period : rangeMock?.chartPeriod ?? 'today';
  const selectedDate = selection.kind === 'range' ? selection.from : today;

  const multiplier = rangeMock?.multiplier ?? periodMultipliers[period];
  const totalRevenue = rangeMock?.totalRevenue ?? revenueTotals[period];

  const products = useMemo(() => {
    return baseProducts
      .map((product) => {
        const sold = Math.round(product.sold * multiplier);

        return {
          ...product,
          sold,
          revenue: sold * product.price,
        };
      })
      .sort((a, b) => b.sold - a.sold);
  }, [multiplier]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

          <View style={styles.logo}>
            <View style={styles.logoMark}>
              <Play size={ICON_SIZE.sm} color={colors.surface} fill={colors.surface} />
            </View>

            <Text style={styles.logoText}>
              stock<Text style={styles.logoAccent}>.</Text>
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.notifications')}
            onPress={() => {
              setNotifications(0);
              console.log('Bildirimler açılacak');
            }}
            style={styles.iconButton}
          >
            <Bell size={ICON_SIZE.lg} color={colors.text} />

            {notifications > 0 && (
              <View style={styles.notificationDot} />
            )}
          </Pressable>
        </View>

        {/* Toplam ciro, tüm dashboard'u etkileyen dönem filtresi ve metrikler */}
        <DashboardHeader
          periodFilter={<PeriodFilter />}
          colors={colors}
          totalRevenue={totalRevenue}
          multiplier={multiplier}
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

        {/* Ana ciro grafiği */}
        <RevenueLineChart
          period={period}
          selectedDate={selectedDate}
          showSold={showSold}
          showOrders={showOrders}
          colors={colors}
          locale={locale}
        />

        {/* Çok satanlar başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.bestSellers')}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.all')}
            onPress={() => console.log('Tüm ürünler açılacak')}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAll}>{t('dashboard.all')}</Text>
            <ChevronRight size={ICON_SIZE.sm} color={colors.orange} />
          </Pressable>
        </View>

        {/* Ürün kartları */}
        <View style={styles.productList}>
          {products.map((product) => (
            <TopSellingCard
              key={product.sku}
              product={product}
              period={period}
              colors={colors}
              locale={locale}
              onPress={() =>
                console.log(`${product.name} detayları açılacak`)
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    content: {
      paddingTop: 8,
      paddingBottom: 36,
    },
    topBar: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.xs,
      marginHorizontal: 20,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    logoMark: {
      width: 29,
      height: 29,
      borderRadius: 10,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      ...typography.h2,
      color: colors.text,
      fontSize: FONT_SIZE.xl,
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: -0.8,
    },
    logoAccent: {
      color: colors.orange,
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
      marginBottom: SPACING.xs,
      marginHorizontal: SPACING.md,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      fontFamily: FONT_FAMILY.bold,
    },
    seeAllButton: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xxs,
    },
    seeAll: {
      ...typography.label,
      color: colors.orange,
      fontFamily: FONT_FAMILY.semiBold,
    },
    productList: {
      gap: SPACING.sm,
      marginHorizontal: SPACING.md,
    },
  });
}