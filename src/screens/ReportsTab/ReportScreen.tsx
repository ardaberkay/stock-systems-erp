import ReportCard from '@/components/cards/ReportCard';
import FilterChip from '@/components/ui/FilterChip';
import StateMessage from '@/components/ui/StateMessage';
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_BY_ID,
  REPORT_DEFAULT_SELECTION,
  REPORT_IDS,
  type ReportCategory,
} from '@/constants/reports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePeriodLabel } from '@/hooks/usePeriodLabel';
import { useReportData } from '@/hooks/useReportData';
import { useTabBarInset } from '@/hooks/useTabBarInset';
import { useTabPressScrollToTop } from '@/hooks/useTabPressScrollToTop';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useNavigation } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';
import Menu from 'lucide-react-native/icons/menu';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const periodLabel = usePeriodLabel(REPORT_DEFAULT_SELECTION);
  const {
    stats,
    productsById,
    paymentNames,
    isPaymentNamesLoading,
    partnerNames,
    error,
    isRefreshing,
    refresh,
  } = useReportData(REPORT_DEFAULT_SELECTION);
  const bottomSpace = useTabBarInset() + SPACING.xl;
  const [category, setCategory] = useState<ReportCategory>('all');
  const visibleIds = REPORT_IDS.filter(
    (id) => category === 'all' || REPORT_CATEGORY_BY_ID[id] === category,
  );

  useTabPressScrollToTop(scrollRef);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('drawer.open')}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconButton}
        >
          <Menu size={ICON_SIZE.lg} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {t('reports.title')}
        </Text>
        <Text style={styles.period} numberOfLines={1}>
          {periodLabel}
        </Text>
      </View>

      <View style={styles.chipBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityRole="radiogroup"
          contentContainerStyle={styles.chips}
        >
          {REPORT_CATEGORIES.map((item) => (
            <FilterChip
              key={item}
              label={t(`reports.categories.${item}`)}
              active={item === category}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: bottomSpace }]}
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
        {error && !stats ? (
          <StateMessage message={t(getErrorMessageKey(error))} onRetry={refresh} />
        ) : (
          visibleIds.map((id) => (
            <ReportCard
              key={id}
              id={id}
              stats={stats}
              productsById={productsById}
              paymentNames={paymentNames}
              isPaymentNamesLoading={isPaymentNamesLoading}
              partnerNames={partnerNames}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xs,
    },
    iconButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...typography.h2,
      flex: 1,
      color: colors.text,
    },
    period: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    chipBar: {
      flexGrow: 0,
    },
    chips: {
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.sm,
    },
    // Kartlar anasayfadaki ürün kartlarıyla aynı genişliktedir
    content: {
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.xs,
    },
  });
}
