import { useAffiliates } from '@/features/affiliates/api/affiliates';
import { useCargoCompanies } from '@/features/orders/api/cargo';
import { useOrderCustomStatuses, useOrderPaymentTypes } from '@/features/orders/api/orders';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import {
  DEFAULT_ORDER_FILTERS,
  ORDER_STATUS_FILTERS,
  type OrderFilters,
} from '@/features/orders/constants/list';
import { getOrderStatusDisplay } from '@/features/orders/constants/status';
import { getCargoCompanyName } from '@/features/orders/utils/cargo';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRevealOpenField } from '@/hooks/useRevealOpenField';
import { useOrderFilterStore } from '@/features/orders/orderFilterStore';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListKey =
  | 'statusIds'
  | 'customStatusIds'
  | 'paymentTypeIds'
  | 'cargoCompanyIds'
  | 'affiliateAccountIds';

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
  const [openSelect, setOpenSelect] = useState<ListKey | null>(null);
  const { scrollProps, onGroupLayout, onFieldLayout } = useRevealOpenField(openSelect);
  const { data: customStatuses } = useOrderCustomStatuses();
  const { data: paymentTypes } = useOrderPaymentTypes();
  const { data: cargoCompanies } = useCargoCompanies();
  const { data: affiliates } = useAffiliates();

  // Seçiliyse çıkarır, değilse ekler; alan açık kalır ki art arda seçilebilsin
  const toggleId = (key: ListKey, id: number) => {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((item) => item !== id)
        : [...current[key], id],
    }));
  };

  const toOptions = (items: { id: number; label: string }[]): SelectOption[] =>
    items.map((item) => ({ value: String(item.id), label: item.label }));

  const selects = [
    {
      key: 'statusIds',
      label: t('orders.statusTitle'),
      items: ORDER_STATUS_FILTERS.map((statusId) => ({
        id: statusId,
        label: t(`orders.status.${getOrderStatusDisplay(statusId).key}`),
      })),
    },
    {
      key: 'customStatusIds',
      label: t('orders.customStatusTitle'),
      items: (customStatuses ?? [])
        .filter((status) => status.status === ACTIVE_STATUS)
        .map((status) => ({ id: status.id, label: status.name })),
    },
    {
      key: 'paymentTypeIds',
      label: t('orders.paymentTitle'),
      items: (paymentTypes ?? []).map((type) => ({ id: type.id, label: type.name })),
    },
    {
      key: 'cargoCompanyIds',
      label: t('orders.cargoTitle'),
      items: (cargoCompanies ?? [])
        .filter((company) => company.status === ACTIVE_STATUS)
        .map((company) => ({ id: company.id, label: getCargoCompanyName(company, t) })),
    },
    {
      key: 'affiliateAccountIds',
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
    // iOS'ta react-native-screens, sheet'te ilk sıradaki ScrollView'u sheet boyuna uzatır ve
    // Uygula butonunun arkasına taşırır. Kapsayıcı düzleştirilmez ve ilk çocuk başlıktır;
    // böylece ScrollView bulunmaz, boyunu yerleşimden alır.
    <View
      collapsable={false}
      style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}
    >
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

      <ScrollView {...scrollProps} style={styles.scroll} contentContainerStyle={styles.content}>
        <View onLayout={onGroupLayout}>
          {/* Çoklu seçim: seçenek işaretlenince alan açık kalır */}
          {selects.map((select) =>
            select.items.length > 0 ? (
              <View key={select.key} onLayout={onFieldLayout(select.key)}>
                <SelectField
                  label={select.label}
                  value={draft[select.key].map(String)}
                  options={toOptions([...select.items])}
                  isOpen={openSelect === select.key}
                  onToggle={() =>
                    setOpenSelect((current) => (current === select.key ? null : select.key))
                  }
                  onSelect={(value) => toggleId(select.key, Number(value))}
                  emptyLabel={t('orders.allOption')}
                />
              </View>
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
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingTop: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
      gap: SPACING.lg,
    },
    // Başlık sabit durur, içerikten kenardan kenara bir çizgiyle ayrılır
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: SPACING.xxl,
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
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
    applyButton: {
      marginHorizontal: SPACING.xl,
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
