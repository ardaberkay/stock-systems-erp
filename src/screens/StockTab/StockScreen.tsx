import ProductCard from '@/components/cards/ProductCard';
import ProductCardSkeleton from '@/components/skeleton/ProductCardSkeleton';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useProductList } from '@/hooks/useProductList';
import { getErrorMessageKey } from '@/lib/apiError';
import type { Product } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { router, useNavigation } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';
import Ellipsis from 'lucide-react-native/icons/ellipsis';
import Menu from 'lucide-react-native/icons/menu';
import Plus from 'lucide-react-native/icons/plus';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SKELETON_CARD_KEYS = ['first', 'second', 'third', 'fourth'];
const FAB_SPACE = 88;

export default function StockScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // iOS'ta sekme çubuğu ekranın üstüne biner ve bu değere dahildir; Android'de ekran çubuğun üstünde biter
  const fabOffset = Platform.OS === 'ios' ? insets.bottom : 0;
  const [searchText, setSearchText] = useState('');
  // Aynı anda tek kart açık kalır; liste uzayıp karışmaz
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const {
    products,
    isFiltering,
    hasActiveFilters,
    isLoading,
    error,
    isRefreshing,
    refresh,
  } = useProductList(searchText);

  const toggleProduct = useCallback((productId: number) => {
    setExpandedId((current) => (current === productId ? null : productId));
  }, []);

  const renderProduct = useCallback<ListRenderItem<Product>>(
    ({ item }) => (
      <ProductCard
        product={item}
        isExpanded={item.id === expandedId}
        onToggle={toggleProduct}
        colors={colors}
        locale={locale}
      />
    ),
    [expandedId, toggleProduct, colors, locale],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Appbar: menü, başlık ve katalog yönetimi */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('drawer.open')}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconButton}
        >
          <Menu size={ICON_SIZE.lg} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>{t('tabs.stock')}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('stock.catalog.title')}
          onPress={() => router.push('/product-catalog')}
          style={styles.iconButton}
        >
          <Ellipsis size={ICON_SIZE.lg} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('stock.searchPlaceholder')}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('stock.filterTitle')}
          onPress={() => router.push('/product-filters')}
          style={styles.filterButton}
        >
          <SlidersHorizontal size={ICON_SIZE.md} color={colors.text} />
          {hasActiveFilters && <View style={styles.filterDot} />}
        </Pressable>
      </View>

      {/* Yer her zaman ayrılır; sonuç yazısı gelip gidince liste zıplamaz */}
      <Text style={styles.resultCount} numberOfLines={1}>
        {isFiltering && !isLoading
          ? t('stock.resultCount', { value: formatNumber(products.length, locale) })
          : ''}
      </Text>

      {error && products.length === 0 ? (
        <StateMessage message={t(getErrorMessageKey(error))} onRetry={refresh} />
      ) : isLoading ? (
        <View style={styles.list}>
          {SKELETON_CARD_KEYS.map((key) => (
            <ProductCardSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          extraData={expandedId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.orange}
            />
          }
          ListEmptyComponent={
            <StateMessage message={t(isFiltering ? 'stock.noResults' : 'stock.empty')} />
          }
        />
      )}

      <FloatingActionButton
        icon={Plus}
        accessibilityLabel={t('stock.addProduct')}
        onPress={() => Alert.alert(t('common.comingSoon'))}
        bottomOffset={fabOffset}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginHorizontal: SPACING.xl,
    },
    filterButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterDot: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.orange,
    },
    resultCount: {
      ...typography.caption,
      minHeight: typography.caption.lineHeight,
      color: colors.textSecondary,
      marginHorizontal: SPACING.xl,
      marginVertical: SPACING.xs,
    },
    list: {
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      // Son kart ekleme butonunun altında kalmasın; sekme çubuğu boşluğunu iOS kendisi ekler
      paddingBottom: FAB_SPACE,
    },
  });
}
