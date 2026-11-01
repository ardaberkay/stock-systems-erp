import { useAffiliates } from '@/api/affiliates';
import { useCargoCompanies } from '@/api/cargo';
import { useOrderCustomStatuses, useOrderPaymentTypes } from '@/api/orders';
import FilterChip from '@/components/ui/FilterChip';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import {
  DEFAULT_ORDER_FILTERS,
  ORDER_STATUS_FILTERS,
  type OrderFilters,
} from '@/constants/orderFilters';
import { getOrderStatusDisplay } from '@/constants/orderStatusDisplay';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useOrderFilterStore } from '@/stores/orderFilterStore';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectKey = 'customStatusId' | 'paymentTypeId' | 'cargoCompanyId' | 'affiliateAccountId';

// "Tümü" seçeneği; filtre değerinde null olarak tutulur
const ALL_VALUE = '';
const ACTIVE_STATUS = 1;

// Seçimler taslakta tutulur; liste yalnızca "Uygula"da hesaplanır, modal takılmaz.
export default function OrderFilterModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const filters = useOrderFilterStore((state) => state.filters);
  const setFilters = useOrderFilterStore((state) => state.setFilters);
  const [draft, setDraft] = useState<OrderFilters>(filters);
  const [openSelect, setOpenSelect] = useState<SelectKey | null>(null);
  const { data: customStatuses } = useOrderCustomStatuses();
  const { data: paymentTypes } = useOrderPaymentTypes();
  const { data: cargoCompanies } = useCargoCompanies();
  const { data: affiliates } = useAffiliates();

  const toggleStatus = (statusId: number) => {
    setDraft((current) => ({
      ...current,
      statusIds: current.statusIds.includes(statusId)
        ? current.statusIds.filter((id) => id !== statusId)
        : [...current.statusIds, statusId],
    }));
  };

  const toOptions = (items: { id: number; label: string }[]): SelectOption[] => [
    { value: ALL_VALUE, label: t('orders.allOption') },
    ...items.map((item) => ({ value: String(item.id), label: item.label })),
  ];

  const selects = [
    {
      key: 'customStatusId',
      label: t('orders.customStatusTitle'),
      items: (customStatuses ?? [])
        .filter((status) => status.status === ACTIVE_STATUS)
        .map((status) => ({ id: status.id, label: status.name })),
    },
    {
      key: 'paymentTypeId',
      label: t('orders.paymentTitle'),
      items: (paymentTypes ?? []).map((type) => ({ id: type.id, label: type.name })),
    },
    {
      key: 'cargoCompanyId',
      label: t('orders.cargoTitle'),
      items: (cargoCompanies ?? [])
        .filter((company) => company.status === ACTIVE_STATUS)
        .map((company) => ({ id: company.id, label: company.fullName || company.name })),
    },
    {
      key: 'affiliateAccountId',
      label: t('orders.partnerTitle'),
      items: (affiliates ?? [])
        .filter((affiliate) => affiliate.status === ACTIVE_STATUS)
        .map((affiliate) => ({
          id: affiliate.id,
          label:
            affiliate.officeName ||
            `${affiliate.firstName ?? ''} ${affiliate.lastName ?? ''}`.trim(),
        })),
    },
  ] as const;

  const apply = () => {
    setFilters(draft);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('orders.filterTitle')}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('orders.resetFilters')}
            onPress={() => setDraft(DEFAULT_ORDER_FILTERS)}
            style={styles.resetButton}
          >
            <Text style={styles.resetText}>{t('orders.resetFilters')}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders.statusTitle')}</Text>
          <View style={styles.chips}>
            {ORDER_STATUS_FILTERS.map((statusId) => (
              <FilterChip
                key={statusId}
                label={t(`orders.status.${getOrderStatusDisplay(statusId).key}`)}
                active={draft.statusIds.includes(statusId)}
                onPress={() => toggleStatus(statusId)}
              />
            ))}
          </View>
        </View>

        <View>
          {selects.map((select) =>
            select.items.length > 0 ? (
              <SelectField
                key={select.key}
                label={select.label}
                value={String(draft[select.key] ?? ALL_VALUE)}
                options={toOptions([...select.items])}
                isOpen={openSelect === select.key}
                onToggle={() =>
                  setOpenSelect((current) => (current === select.key ? null : select.key))
                }
                onSelect={(value) => {
                  setDraft((current) => ({
                    ...current,
                    [select.key]: value === ALL_VALUE ? null : Number(value),
                  }));
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
