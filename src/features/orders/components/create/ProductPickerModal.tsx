import { useProducts } from '@/features/products/api/products';
import ProductPickerRow from '@/features/orders/components/create/ProductPickerRow';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import { PRODUCT_STATUS } from '@/features/products/constants/products';
import { useOpenBarcodeScanner } from '@/features/products/hooks/useOpenBarcodeScanner';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { Product, ProductVariant } from '@/features/products/schemas/products';
import { usePickerStore } from '@/features/picker/pickerStore';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  buildBarcodeIndex,
  getBarcodeMatches,
  getBarcodeVariantMatches,
  getSingleBarcodeMatch,
  matchesProductText,
  normalizeText,
} from '@/features/products/utils/productList';
import { router } from 'expo-router';
import ScanBarcode from 'lucide-react-native/icons/scan-barcode';
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
  // Okunan barkod arama kutusuna yazılır; eşleşme ve satırın açılması aramanın işidir
  const openBarcodeScanner = useOpenBarcodeScanner(setQuery, { activeOnly: true });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const debouncedQuery = useDebounce(query);
  const { data: products, isPending, error, refetch } = useProducts();
  const cartQuantities = request?.cartQuantities ?? NO_CART;
  const onPick = request?.onPick;

  // Büyük katalogda her aramada tüm varyantlar gezilmesin; katalog değişince bir kez kurulur
  const barcodeIndex = useMemo(() => buildBarcodeIndex(products ?? []), [products]);
  const barcodeMatches = getBarcodeMatches(barcodeIndex, debouncedQuery);
  // Okutulan barkodun bedeni satırda turuncu çerçeveyle gösterilir
  const barcodeVariantIds = getBarcodeVariantMatches(barcodeIndex, debouncedQuery);

  // Pasif ürün panelde satışa kapalıdır; barkodla bulunsa da listede gösterilmez
  const visibleProducts = useMemo(() => {
    const active = (products ?? []).filter((product) => product.status === PRODUCT_STATUS.active);
    const normalized = normalizeText(debouncedQuery);

    if (!normalized) {
      return active;
    }

    return active.filter(
      (product) => barcodeMatches.has(product.id) || matchesProductText(product, normalized),
    );
  }, [products, debouncedQuery, barcodeMatches]);

  // Barkod tek (aktif) ürüne denk gelince satırı açık gelir, bedenler ve stok görünür.
  // Yalnızca eşleşme değişince açılır; kullanıcı kapatırsa aynı arama durdukça açılmaz.
  const singleMatchId = getSingleBarcodeMatch(barcodeMatches);
  const barcodeMatchId =
    singleMatchId !== null && visibleProducts.some((product) => product.id === singleMatchId)
      ? singleMatchId
      : null;
  const [openedMatchId, setOpenedMatchId] = useState<number | null>(null);
  if (barcodeMatchId !== openedMatchId) {
    setOpenedMatchId(barcodeMatchId);
    if (barcodeMatchId !== null) {
      setExpandedId(barcodeMatchId);
    }
  }

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
          highlightedVariantIds={barcodeMatches.has(item.id) ? barcodeVariantIds : undefined}
        />
      );
    },
    [
      expandedId,
      cartQuantities,
      colors,
      locale,
      handleToggle,
      handlePick,
      barcodeMatches,
      barcodeVariantIds,
    ],
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
              action={{
                icon: ScanBarcode,
                accessibilityLabel: t('stock.barcodeScan.open'),
                onPress: openBarcodeScanner,
              }}
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
