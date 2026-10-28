import TopSellingCard from '@/components/cards/TopSellingCard';
import RevenueLineChart from '@/components/charts/RevenueLineChart';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PeriodChipFilters from '@/components/ui/PeriodChipFilters';
import type { Period } from '@/mocks/dashboard';
import {
  baseProducts,
  periodMultipliers,
  revenueTotals,
} from '@/mocks/dashboard';
import { lightColors, type AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { formatDateTime } from '@/utils/formatter';
import {
  BellIcon,
  MenuIcon,
  PlayIcon,
} from 'panelui-native';
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
  const { t, i18n } = useTranslation();
  const locale = (
    i18n.resolvedLanguage ?? i18n.language
  ).startsWith('en')
    ? 'en-US'
    : 'tr-TR';
  const [revenuePeriod, setRevenuePeriod] = useState<Period>('Bugün');
  const [productsPeriod, setProductsPeriod] = useState<Period>('Bugün');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customDateActive, setCustomDateActive] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showSold, setShowSold] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  // Dashboard şimdilik açık tema renklerini kullanıyor.
  const colors: AppColors = lightColors;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const products = useMemo(() => {
    return baseProducts
      .map((product) => {
        const sold = Math.round(
          product.sold * periodMultipliers[productsPeriod],
        );

        return {
          ...product,
          sold,
          revenue: sold * product.price,
        };
      })
      .sort((a, b) => b.sold - a.sold);
  }, [productsPeriod]);

  const totalRevenue = customDateActive
    ? Math.round(
      revenueTotals.Bugün *
      (1 + ((selectedDate.getDate() % 5) - 2) * 0.035),
    )
    : revenueTotals[revenuePeriod];

  const multiplier = customDateActive
    ? 1
    : periodMultipliers[revenuePeriod];

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setRevenuePeriod('Bugün');
    setProductsPeriod('Bugün');
    setCustomDateActive(true);
  };

  const handleRevenuePeriodChange = (period: Period) => {
    setRevenuePeriod(period);
    setCustomDateActive(false);
  };

  const handleProductsPeriodChange = (period: Period) => {
    setProductsPeriod(period);
    setCustomDateActive(false);
  };

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
            accessibilityLabel="Menüyü aç"
            onPress={() => console.log('Menü açılacak')}
            style={styles.iconButton}
          >
            <MenuIcon size={27} color={colors.text} />
          </Pressable>

          <View style={styles.logo}>
            <View style={styles.logoMark}>
              <PlayIcon size={17} color={colors.surface} />
            </View>

            <Text style={styles.logoText}>
              stock<Text style={styles.logoAccent}>.</Text>
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bildirimler"
            onPress={() => {
              setNotifications(0);
              console.log('Bildirimler açılacak');
            }}
            style={styles.iconButton}
          >
            <BellIcon size={23} color={colors.text} />

            {notifications > 0 && (
              <View style={styles.notificationDot} />
            )}
          </Pressable>
        </View>

        {/* Ciro grafiğinin filtreleri */}
        <PeriodChipFilters
          value={revenuePeriod}
          onChange={handleRevenuePeriodChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          colors={colors}
          locale={locale}
          formatDateTime={(date) => formatDateTime(date, locale)}
        />

        {/* Toplam ciro ve metrikler */}
        <DashboardHeader
          colors={colors}
          totalRevenue={totalRevenue}
          selectedDate={selectedDate}
          customDateActive={customDateActive}
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
          period={revenuePeriod}
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
            onPress={() => console.log('Tüm ürünler açılacak')}
          >
            <Text style={styles.seeAll}>
              {t('dashboard.all')} <Text>›</Text>
            </Text>
          </Pressable>
        </View>

        {/* Ürünlerin filtreleri */}
        <PeriodChipFilters
          value={productsPeriod}
          onChange={handleProductsPeriodChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          colors={colors}
          locale={locale}
          formatDateTime={(date) => formatDateTime(date, locale)}
        />

        {/* Ürün kartları */}
        <View style={styles.productList}>
          {products.map((product) => (
            <TopSellingCard
              key={product.sku}
              product={product}
              period={productsPeriod}
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
      marginBottom: 24,
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      marginHorizontal: 20,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: FONT_SIZE.xl,
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: -0.4,
    },
    seeAll: {
      color: colors.orange,
      fontSize: FONT_SIZE.sm,
      fontFamily: FONT_FAMILY.bold,
    },
    productList: {
      gap: 10,
      marginTop: 12,
      marginHorizontal: 12,
    },
  });
}