import ChoiceOptionRow from '@/components/forms/ChoiceOptionRow';
import PickerOptionRow from '@/components/forms/PickerOptionRow';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorMessageKey } from '@/lib/apiError';
import { usePickerStore, type PickerItem, type PickerValue } from '@/stores/pickerStore';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalizeText } from '@/utils/productList';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PickerModalProps = {
  // Uzun listelerde (il, ilçe, ülke) arama kutusu olur ve pencere sabit yükseklikte açılır;
  // kısa listeler içerik kadar açılır (bkz. src/app/_layout.tsx)
  searchable: boolean;
};

// Formlardaki seçim alanlarının native sheet'i. Liste ve seçim sonrası iş pickerStore'dan gelir.
export default function PickerModal({ searchable }: PickerModalProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const request = usePickerStore((state) => state.request);
  const [query, setQuery] = useState('');

  const items = request?.items;
  const onSelect = request?.onSelect;
  const selectedValue = request?.value ?? null;

  // Ad ve ek bilgideki rakamlarla aranır ("ankara", "+44", "90 392")
  const visibleItems = useMemo(() => {
    const all = items ?? [];
    const normalized = normalizeText(query);
    const digits = query.replace(/[+\s]/g, '');
    const isDigits = /^\d+$/.test(digits);

    if (!normalized) {
      return all;
    }

    return all.filter(
      (item) =>
        normalizeText(item.label).includes(normalized) ||
        (isDigits && (item.detail ?? '').replace(/[+\s]/g, '').startsWith(digits)),
    );
  }, [items, query]);

  const handleSelect = useCallback(
    (value: PickerValue) => {
      onSelect?.(value);
      router.back();
    },
    [onSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: PickerItem }) => (
      <PickerOptionRow
        value={item.value}
        label={item.label}
        detail={item.detail}
        badge={item.badge}
        disabled={item.disabled}
        selected={item.value === selectedValue}
        colors={colors}
        onSelect={handleSelect}
      />
    ),
    [selectedValue, colors, handleSelect],
  );

  if (!request) {
    return <StateMessage message={t('errors.unknown')} />;
  }

  // Liste henüz gelmediyse veya gelemediyse satırların yerinde durum görünür
  const loadState =
    request.isLoading && request.items.length === 0 ? (
      <ActivityIndicator style={styles.loading} color={colors.orange} />
    ) : request.loadError && request.items.length === 0 ? (
      <StateMessage message={t(getErrorMessageKey(request.loadError))} onRetry={request.onRetry} />
    ) : null;

  const title = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        {request.title}
      </Text>
      {request.note ? <Text style={styles.note}>{request.note}</Text> : null}
    </View>
  );

  // Kısa liste: pencere içerik kadar; her seçenek ayrı kutu, flex kullanılmaz
  if (!searchable) {
    return (
      <View style={{ paddingBottom: insets.bottom + SPACING.lg }}>
        {title}
        {loadState ?? (
          <View accessibilityRole="radiogroup" style={styles.choices}>
            {request.items.map((item) => (
              <ChoiceOptionRow
                key={item.value}
                value={item.value}
                label={item.label}
                badge={item.badge}
                disabled={item.disabled}
                content={item.content}
                selected={item.value === selectedValue}
                colors={colors}
                onSelect={handleSelect}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // Başlık ve arama listenin yapışık üst kısmıdır. Native sheet kaydırılan listeyi en üste
  // yerleştirdiği için dışarıda kalırlarsa liste ikisinin üstüne biniyordu.
  return (
    <FlatList
      style={styles.fill}
      data={visibleItems}
      keyExtractor={(item) => String(item.value)}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.stickyHeader}>
          {title}
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
      initialNumToRender={20}
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
      gap: SPACING.xs,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxl,
      paddingBottom: SPACING.md,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    note: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    choices: {
      gap: SPACING.sm,
      paddingHorizontal: SPACING.xl,
    },
    loading: {
      paddingVertical: SPACING.xxl,
    },
    search: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
    },
  });
}
