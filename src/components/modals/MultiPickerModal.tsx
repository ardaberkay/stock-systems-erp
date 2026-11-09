import CheckboxOptionRow from '@/components/forms/CheckboxOptionRow';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorMessageKey } from '@/lib/apiError';
import { usePickerStore, type PickerItem, type PickerValue } from '@/stores/pickerStore';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { normalizeText } from '@/utils/productList';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Çoklu seçim penceresi (ör. kategoriler). Seçim pencerede tutulur, "Tamam"a basınca forma
// bir kerede yazılır; kapatıp vazgeçmek formu değiştirmez.
export default function MultiPickerModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const request = usePickerStore((state) => state.multiRequest);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PickerValue[]>(() => request?.values ?? []);

  const items = request?.items;

  const visibleItems = useMemo(() => {
    const all = items ?? [];
    const normalized = normalizeText(query);

    return normalized ? all.filter((item) => normalizeText(item.label).includes(normalized)) : all;
  }, [items, query]);

  const toggle = useCallback((value: PickerValue) => {
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PickerItem }) => (
      <CheckboxOptionRow
        value={item.value}
        label={item.label}
        checked={selected.includes(item.value)}
        colors={colors}
        onToggle={toggle}
      />
    ),
    [selected, colors, toggle],
  );

  if (!request) {
    return <StateMessage message={t('errors.unknown')} />;
  }

  const confirm = () => {
    request.onConfirm(selected);
    router.back();
  };

  const loadState =
    request.isLoading && request.items.length === 0 ? (
      <ActivityIndicator style={styles.loading} color={colors.orange} />
    ) : request.loadError && request.items.length === 0 ? (
      <StateMessage message={t(getErrorMessageKey(request.loadError))} onRetry={request.onRetry} />
    ) : null;

  // Başlık, "Tamam" ve arama listenin yapışık üst kısmıdır (bkz. PickerModal)
  return (
    <FlatList
      style={styles.fill}
      data={visibleItems}
      keyExtractor={(item) => String(item.value)}
      renderItem={renderItem}
      extraData={selected}
      ListHeaderComponent={
        <View style={styles.stickyHeader}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {request.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.done')}
              onPress={confirm}
              style={styles.doneButton}
            >
              <Text style={styles.done}>{t('common.done')}</Text>
            </Pressable>
          </View>
          <View style={styles.search}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={request.searchPlaceholder ?? ''}
            />
          </View>
        </View>
      }
      stickyHeaderIndices={[0]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.lg }}
      ListEmptyComponent={loadState ?? <StateMessage message={t('orders.create.noResults')} />}
    />
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    fill: {
      flex: 1,
    },
    stickyHeader: {
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
      paddingLeft: SPACING.xl,
      paddingRight: SPACING.sm,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.xs,
    },
    title: {
      ...typography.h3,
      flex: 1,
      color: colors.text,
    },
    doneButton: {
      minWidth: MIN_TOUCH_SIZE,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.md,
    },
    done: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.orange,
    },
    search: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
    },
    loading: {
      paddingVertical: SPACING.xxl,
    },
  });
}
