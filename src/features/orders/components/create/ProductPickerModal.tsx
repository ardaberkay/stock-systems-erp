import { useProducts } from '@/features/products/api/products';
import ProductPickerRow from '@/features/orders/components/create/ProductPickerRow';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import { PRODUCT_STATUS } from '@/features/products/constants/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { Product, ProductVariant } from '@/features/products/schemas/products';
import { usePickerStore } from '@/features/picker/pickerStore';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalizeText } from '@/features/products/utils/productList';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NO_CART = new Map<number, number>();

// Sipariş oluştururken ürün ve beden seçimi; tam boy native sheet (bkz. src/app/_layout.tsx).
// Katalog bellekteyse anında açılır; yoksa pencere açılınca bir kez istenir (stoktaki gibi).
export default function ProductPickerModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const request = usePickerStore((state) => state.productRequest);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const debouncedQuery = useDebounce(query);
  const { data: products, isPending, error, refetch } = useProducts();
  const cartQuantities = request?.cartQuantities ?? NO_CART;
  const onPick = request?.onPick;

  // Pasif ürün panelde satışa kapalıdır; listede gösterilmez
  const visibleProducts = useMemo(() => {
    const active = (products ?? []).filter((product) => product.status === PRODUCT_STATUS.active);
    const normalized = normalizeText(debouncedQuery);

    if (!normalized) {
      return active;
    }

    return active.filter(
      (product) =>
        normalizeText(product.name).includes(normalized) ||
        normalizeText(product.modelCode ?? '').includes(normalized),
    );
  }, [products, debouncedQuery]);

  const handleToggle = useCallback((productId: number) => {
    setExpandedId((current) => (current === productId ? null : productId));
  }, []);

  const handlePick = useCallback(
    (product: Product, variant: ProductVariant) => {
      onPick?.(product, variant);
      router.back();
    },
    [onPick],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => {
      const expanded = item.id === expandedId;

      return (
        <ProductPickerRow
          product={item}
          expanded={expanded}
          cartQuantities={expanded ? cartQuantities : null}
          colors={colors}
          locale={locale}
          onToggle={handleToggle}
          onPick={handlePick}
        />
      );
    },
    [expandedId, cartQuantities, colors, locale, handleToggle, handlePick],
  );

  // Başlık ve arama listenin yapışık üst kısmıdır: native sheet kaydırılan listeyi en üste
  // yerleştirir, dışarıda kalırlarsa liste üstlerine biner. Yükleniyor ve hata da liste içinde.
  return (
    <FlatList
      style={styles.screen}
      data={isPending || error ? [] : visibleProducts}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      extraData={expandedId}
      ListHeaderComponent={
        <View style={styles.stickyHeader}>
          <Text style={styles.title} accessibilityRole="header">
            {t('orders.create.products.pickerTitle')}
          </Text>
          <View style={styles.search}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t('orders.create.products.searchPlaceholder')}
            />
          </View>
        </View>
      }
      stickyHeaderIndices={[0]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      initialNumToRender={12}
      contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.lg }}
      ListEmptyComponent={
        isPending ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : error ? (
          <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />
        ) : (
          <StateMessage message={t('orders.create.products.noResults')} />
        )
      }
    />
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    stickyHeader: {
      backgroundColor: colors.surface,
    },
    title: {
      ...typography.h3,
      color: colors.text,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxl,
      paddingBottom: SPACING.md,
    },
    search: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
    },
    state: {
      paddingVertical: SPACING.xxxl,
      alignItems: 'center',
    },
  });
}
