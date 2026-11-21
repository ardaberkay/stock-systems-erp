import SelectField from '@/components/ui/SelectField';
import Text from '@/components/ui/Text';
import { useAffiliateFilterStore } from '@/features/affiliates/affiliateFilterStore';
import {
  AFFILIATE_SORTS,
  AFFILIATE_STATUS_FILTERS,
  DEFAULT_AFFILIATE_FILTERS,
  type AffiliateFilters,
  type AffiliateSort,
  type AffiliateStatusFilter,
} from '@/features/affiliates/affiliateList';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectKey = 'sort' | 'status';

// Seçimler taslakta tutulur; liste yalnızca "Uygula"da değişir. Ürün ve sipariş filtresiyle
// aynı düzendedir; içerik kısa olduğu için sheet içerik kadar açılır, ScrollView gerekmez.
export default function AffiliateFilterModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const filters = useAffiliateFilterStore((state) => state.filters);
  const setFilters = useAffiliateFilterStore((state) => state.setFilters);
  const [draft, setDraft] = useState<AffiliateFilters>(filters);
  const [openSelect, setOpenSelect] = useState<SelectKey | null>(null);

  const toggleSelect = (key: SelectKey) => {
    setOpenSelect((current) => (current === key ? null : key));
  };

  // Seçiliyse çıkarır, değilse ekler; alan açık kalır ki art arda seçilebilsin
  const toggleStatus = (value: string) => {
    const status = AFFILIATE_STATUS_FILTERS.find(
      (item): item is AffiliateStatusFilter => item === value,
    );
    if (!status) {
      return;
    }
    setDraft((current) => ({
      ...current,
      status: current.status.includes(status)
        ? current.status.filter((item) => item !== status)
        : [...current.status, status],
    }));
  };

  const apply = () => {
    setFilters(draft);
    router.back();
  };

  return (
    <View style={{ paddingBottom: insets.bottom + SPACING.lg }}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {t('affiliates.filterTitle')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('affiliates.resetFilters')}
          onPress={() => setDraft(DEFAULT_AFFILIATE_FILTERS)}
          style={styles.resetButton}
        >
          <Text style={styles.resetText}>{t('affiliates.resetFilters')}</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <SelectField
          label={t('affiliates.sortTitle')}
          value={draft.sort}
          options={AFFILIATE_SORTS.map((value) => ({
            value,
            label: t(`affiliates.sort.${value}`),
          }))}
          isOpen={openSelect === 'sort'}
          onToggle={() => toggleSelect('sort')}
          onSelect={(value) => {
            const sort = AFFILIATE_SORTS.find((item): item is AffiliateSort => item === value);
            setDraft((current) => ({ ...current, sort: sort ?? DEFAULT_AFFILIATE_FILTERS.sort }));
            setOpenSelect(null);
          }}
        />

        {/* Çoklu seçim: hiçbiri işaretli değilse "Tümü" görünür ve filtre uygulanmaz */}
        <SelectField
          label={t('affiliates.statusTitle')}
          value={draft.status}
          options={AFFILIATE_STATUS_FILTERS.map((value) => ({
            value,
            label: t(`affiliates.status.${value}`),
          }))}
          isOpen={openSelect === 'status'}
          onToggle={() => toggleSelect('status')}
          onSelect={toggleStatus}
          emptyLabel={t('affiliates.status.all')}
        />
      </View>

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
    content: {
      paddingTop: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
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
