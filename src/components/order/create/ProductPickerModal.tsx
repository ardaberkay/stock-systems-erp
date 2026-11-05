import { useProducts } from '@/api/products';
import SheetModal from '@/components/forms/SheetModal';
import ProductPickerRow from '@/components/order/create/ProductPickerRow';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import { PRODUCT_STATUS } from '@/constants/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { Product, ProductVariant } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { normalizeText } from '@/utils/productList';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

type ProductPickerModalProps = {
  visible: boolean;
  cartQuantities: ReadonlyMap<number, number>;
  onClose: () => void;
  onPick: (product: Product, variant: ProductVariant) => void;
};

// Katalog bellekteyse anında açılır; yoksa pencere açılınca bir kez istenir (stoktaki gibi)
export default function ProductPickerModal({
  visible,
  cartQuantities,
  onClose,
  onPick,
}: ProductPickerModalProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const debouncedQuery = useDebounce(query);
  const { data: products, isPending, error, refetch } = useProducts({ enabled: visible });

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

  const close = useCallback(() => {
    setQuery('');
    setExpandedId(null);
    onClose();
  }, [onClose]);

  const handleToggle = useCallback((productId: number) => {
    setExpandedId((current) => (current === productId ? null : productId));
  }, []);

  const handlePick = useCallback(
    (product: Product, variant: ProductVariant) => {
      onPick(product, variant);
      close();
    },
    [onPick, close],
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

  return (
    <SheetModal visible={visible} title={t('orders.create.products.pickerTitle')} onClose={close}>
      <View style={styles.search}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('orders.create.products.searchPlaceholder')}
        />
      </View>
      {isPending ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.orange} />
        </View>
      ) : error ? (
        <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={visibleProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          extraData={expandedId}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={12}
          ListEmptyComponent={<StateMessage message={t('orders.create.products.noResults')} />}
        />
      )}
    </SheetModal>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    search: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
      backgroundColor: colors.background,
    },
    state: {
      paddingVertical: SPACING.xxxl,
      alignItems: 'center',
    },
  });
}
