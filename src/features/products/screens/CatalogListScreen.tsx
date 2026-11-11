import Divider from '@/components/ui/Divider';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import SearchBar from '@/components/ui/SearchBar';
import Skeleton from '@/components/ui/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import { useCatalogItems, useCatalogProductCounts } from '@/features/products/api/catalogItems';
import CatalogItemRow from '@/features/products/components/catalog/CatalogItemRow';
import {
  catalogKindSchema,
  type CatalogItem,
  type CatalogKind,
} from '@/features/products/schemas/catalog';
import { getVisibleCatalogItems } from '@/features/products/utils/catalog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Plus from 'lucide-react-native/icons/plus';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CatalogListContentProps = {
  kind: CatalogKind;
};

const SKELETON_ROW_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8'];
// Son satır ekleme butonunun altında kalmasın
const FAB_SPACE = 88;

// Satır metniyle aynı hizada başlar
function RowDivider() {
  return <Divider inset={SPACING.xl} />;
}

// Ürün tipi, marka, renk ve kategori listeleri (catalog/[kind]): arama, ürün sayısı, ekleme.
export default function CatalogListScreen() {
  const { t } = useTranslation();
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const parsedKind = catalogKindSchema.safeParse(kind);

  if (!parsedKind.success) {
    return <StateMessage message={t('errors.notFound')} />;
  }

  return <CatalogListContent kind={parsedKind.data} />;
}

function CatalogListContent({ kind }: CatalogListContentProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchText, setSearchText] = useState('');
  const query = useDebounce(searchText);
  const { data, isPending, error, refetch } = useCatalogItems(kind);
  const { productCounts, refetchProducts } = useCatalogProductCounts(kind);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isSearching = query.trim().length > 0;

  const items = useMemo(() => getVisibleCatalogItems(data ?? [], query), [data, query]);

  // Sessiz yenilemede gösterge dönmesin; yalnızca kullanıcı aşağı çekince görünür.
  // Ürün sayıları ürün listesinden geldiği için o da yenilenir (istekler sırayla gider).
  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), refetchProducts()]);
    setIsRefreshing(false);
  };

  const openForm = useCallback(
    (id?: number) =>
      router.push({
        pathname: '/catalog-form/[kind]',
        params: id === undefined ? { kind } : { kind, id: String(id) },
      }),
    [kind],
  );

  const renderItem = useCallback<ListRenderItem<CatalogItem>>(
    ({ item }) => (
      <CatalogItemRow
        item={item}
        // Katalog yüklendiyse ürünü olmayan kayıtta 0 yazılır
        productCount={productCounts ? (productCounts.get(item.id) ?? 0) : undefined}
        onPress={openForm}
        showColorDot={kind === 'colors'}
        colors={colors}
        locale={locale}
      />
    ),
    [productCounts, openForm, kind, colors, locale],
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t(`stock.catalog.${kind}`) }} />

      <View style={styles.searchRow}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t(`stock.catalogPages.${kind}.searchPlaceholder`)}
        />
      </View>

      {error && !data ? (
        <StateMessage message={t(getErrorMessageKey(error))} onRetry={refresh} />
      ) : isPending ? (
        <View>
          {SKELETON_ROW_KEYS.map((key) => (
            <View key={key} style={styles.skeletonRow}>
              <Skeleton width="50%" height={typography.body.lineHeight} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={RowDivider}
          contentContainerStyle={{ paddingBottom: FAB_SPACE + insets.bottom }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.orangeWhite}
              colors={[colors.orangeWhite]}
              progressBackgroundColor={colors.surface}
            />
          }
          ListEmptyComponent={
            <StateMessage
              message={t(
                isSearching
                  ? `stock.catalogPages.${kind}.noResults`
                  : `stock.catalogPages.${kind}.empty`,
              )}
            />
          }
        />
      )}

      <FloatingActionButton
        icon={Plus}
        accessibilityLabel={t(`stock.catalogPages.${kind}.add`)}
        onPress={() => openForm()}
        bottomOffset={insets.bottom}
      />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      ...SCREEN_CONTENT,
      flex: 1,
      backgroundColor: colors.background,
    },
    searchRow: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm,
    },
    skeletonRow: {
      minHeight: MIN_TOUCH_SIZE + SPACING.sm,
      justifyContent: 'center',
      paddingHorizontal: SPACING.xl,
    },
  });
}
