import { useProducts } from '@/api/products';
import FilterChip from '@/components/ui/FilterChip';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import {
  DEFAULT_PRODUCT_FILTERS,
  PRODUCT_SORTS,
  STATUS_FILTERS,
  STOCK_FILTERS,
  type ProductFilters,
  type ProductSort,
} from '@/constants/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProductFilterStore } from '@/stores/productFilterStore';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { getProductFilterOptions } from '@/utils/productList';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectKey = 'sort' | 'brand' | 'type' | 'category';

// "Tümü" seçeneği; filtre değerinde null olarak tutulur
const ALL_VALUE = '';

// Seçimler taslakta tutulur; liste yalnızca "Uygula"da hesaplanır, modal takılmaz.
export default function ProductFilterModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const filters = useProductFilterStore((state) => state.filters);
  const setFilters = useProductFilterStore((state) => state.setFilters);
  const [draft, setDraft] = useState<ProductFilters>(filters);
  const [openSelect, setOpenSelect] = useState<SelectKey | null>(null);
  const { data: products } = useProducts();

  const catalog = useMemo(() => getProductFilterOptions(products ?? []), [products]);

  const updateDraft = (patch: Partial<ProductFilters>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const toNameOptions = (values: string[]): SelectOption[] => [
    { value: ALL_VALUE, label: t('stock.statusFilter.all') },
    ...values.map((value) => ({ value, label: value })),
  ];

  const nameSelects = [
    { key: 'brand', label: t('stock.brand'), values: catalog.brands, selected: draft.brand },
    { key: 'type', label: t('stock.type'), values: catalog.types, selected: draft.type },
    {
      key: 'category',
      label: t('stock.category'),
      values: catalog.categories,
      selected: draft.category,
    },
  ] as const;

  const toggleSelect = (key: SelectKey) => {
    setOpenSelect((current) => (current === key ? null : key));
  };

  const apply = () => {
    setFilters(draft);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('stock.filterTitle')}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('stock.resetFilters')}
            onPress={() => setDraft(DEFAULT_PRODUCT_FILTERS)}
            style={styles.resetButton}
          >
            <Text style={styles.resetText}>{t('stock.resetFilters')}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stock.stockTitle')}</Text>
          <View accessibilityRole="radiogroup" style={styles.chips}>
            {STOCK_FILTERS.map((value) => (
              <FilterChip
                key={value}
                label={t(`stock.stockFilter.${value}`)}
                active={draft.stock === value}
                onPress={() => updateDraft({ stock: value })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stock.status')}</Text>
          <View accessibilityRole="radiogroup" style={styles.chips}>
            {STATUS_FILTERS.map((value) => (
              <FilterChip
                key={value}
                label={t(`stock.statusFilter.${value}`)}
                active={draft.status === value}
                onPress={() => updateDraft({ status: value })}
              />
            ))}
          </View>
        </View>

        <View>
          <SelectField
            label={t('stock.sortTitle')}
            value={draft.sort}
            options={PRODUCT_SORTS.map((value) => ({ value, label: t(`stock.sort.${value}`) }))}
            isOpen={openSelect === 'sort'}
            onToggle={() => toggleSelect('sort')}
            onSelect={(value) => {
              const sort = PRODUCT_SORTS.find((item): item is ProductSort => item === value);
              updateDraft({ sort: sort ?? DEFAULT_PRODUCT_FILTERS.sort });
              setOpenSelect(null);
            }}
          />

          {nameSelects.map((select) =>
            select.values.length > 0 ? (
              <SelectField
                key={select.key}
                label={select.label}
                value={select.selected ?? ALL_VALUE}
                options={toNameOptions(select.values)}
                isOpen={openSelect === select.key}
                onToggle={() => toggleSelect(select.key)}
                onSelect={(value) => {
                  updateDraft({ [select.key]: value === ALL_VALUE ? null : value });
                  setOpenSelect(null);
                }}
              />
            ) : null,
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('filters.apply')}
        onPress={apply}
        style={styles.applyButton}
      >
        <Text style={styles.applyText}>{t('filters.apply')}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingTop: SPACING.xxl,
      gap: SPACING.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    resetButton: {
      minHeight: MIN_TOUCH_SIZE,
      justifyContent: 'center',
    },
    resetText: {
      ...typography.label,
      color: colors.orange,
      fontFamily: FONT_FAMILY.semiBold,
    },
    section: {
      gap: SPACING.sm,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.textSecondary,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
    },
    applyButton: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      backgroundColor: colors.buttonPrimary,
    },
    applyText: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.buttonPrimaryText,
    },
  });
}
