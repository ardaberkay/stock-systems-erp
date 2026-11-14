import SearchFilterBar from '@/components/ui/SearchFilterBar';
import Skeleton from '@/components/ui/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import Text from '@/components/ui/Text';
import { useAffiliateFilterStore } from '@/features/affiliates/affiliateFilterStore';
import { getVisibleAffiliates, isDefaultAffiliateFilters } from '@/features/affiliates/affiliateList';
import { useAffiliates } from '@/features/affiliates/api/affiliates';
import AffiliateCard from '@/features/affiliates/components/AffiliateCard';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SKELETON_CARD_KEYS = ['1', '2', '3', '4', '5'];
// İskelet kart, gerçek kartın yaklaşık yüksekliğinde (avatar + alt satır)
const SKELETON_CARD_HEIGHT = 124;

const openDetail = (id: number) => {
  router.push({ pathname: '/affiliate-detail/[id]', params: { id: String(id) } });
};

// Satış ortakları: aktif ve pasifler birlikte; sıralama ve durum filtresi sheet'ten seçilir.
// API ortak ekleme/silme sunmadığı için ekleme butonu yok.
export default function AffiliateListScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const filters = useAffiliateFilterStore((state) => state.filters);
  const [searchText, setSearchText] = useState('');
  const query = useDebounce(searchText);
  const { data, isPending, error, refetch } = useAffiliates();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFilterActive = !isDefaultAffiliateFilters(filters);
  const isFiltered = query.trim().length > 0 || filters.status !== 'all';

  const affiliates = useMemo(
    () => getVisibleAffiliates(data ?? [], query, filters),
    [data, query, filters],
  );

  // Sessiz yenilemede gösterge dönmesin; yalnızca kullanıcı aşağı çekince görünür.
  const refresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderItem = useCallback<ListRenderItem<Affiliate>>(
    ({ item }) => (
      <AffiliateCard affiliate={item} onPress={openDetail} colors={colors} locale={locale} />
    ),
    [colors, locale],
  );

  // Kaç ortak listelendiği; arama ve filtre sonucunu da gösterir
  const summary =
    affiliates.length > 0 ? (
      <Text style={styles.summary}>
        {t('affiliates.count', { value: formatNumber(affiliates.length, locale) })}
      </Text>
    ) : undefined;

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <SearchFilterBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('affiliates.searchPlaceholder')}
          filterLabel={t('affiliates.filterTitle')}
          isFilterActive={isFilterActive}
          onFilterPress={() => router.push('/affiliate-filters')}
        />
      </View>

      {error && !data ? (
        <StateMessage message={t(getErrorMessageKey(error))} onRetry={refresh} />
      ) : isPending ? (
        <View style={styles.listContent}>
          {SKELETON_CARD_KEYS.map((key) => (
            <Skeleton
              key={key}
              width="100%"
              height={SKELETON_CARD_HEIGHT}
              radius={RADIUS.lg}
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={affiliates}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={summary}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: SPACING.xl + insets.bottom },
          ]}
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
            <StateMessage message={t(isFiltered ? 'affiliates.noResults' : 'affiliates.empty')} />
          }
        />
      )}
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
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
    },
    // Kartlar arası boşluk; özet satırı da listenin ilk elemanı gibi aynı boşlukla ayrılır
    listContent: {
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xs,
    },
    summary: {
      ...typography.label,
      color: colors.textSecondary,
    },
  });
}
