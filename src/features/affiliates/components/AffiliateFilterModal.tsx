import SegmentedControl from '@/components/ui/SegmentedControl';
import Text from '@/components/ui/Text';
import { useAffiliateFilterStore } from '@/features/affiliates/affiliateFilterStore';
import {
  AFFILIATE_SORTS,
  AFFILIATE_STATUS_FILTERS,
  DEFAULT_AFFILIATE_FILTERS,
  type AffiliateFilters,
} from '@/features/affiliates/affiliateList';
import ChoiceOptionRow from '@/features/picker/components/ChoiceOptionRow';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Seçimler taslakta tutulur; liste yalnızca "Uygula"da değişir.
export default function AffiliateFilterModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const filters = useAffiliateFilterStore((state) => state.filters);
  const setFilters = useAffiliateFilterStore((state) => state.setFilters);
  const [draft, setDraft] = useState<AffiliateFilters>(filters);

  const statusOptions = AFFILIATE_STATUS_FILTERS.map((value) => ({
    value,
    label: t(`affiliates.status.${value}`),
  }));

  const apply = () => {
    setFilters(draft);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('affiliates.statusTitle')}</Text>
        <SegmentedControl
          options={statusOptions}
          value={draft.status}
          onChange={(status) => setDraft((current) => ({ ...current, status }))}
        />
      </View>

      <View style={styles.section} accessibilityRole="radiogroup">
        <Text style={styles.sectionTitle}>{t('affiliates.sortTitle')}</Text>
        {AFFILIATE_SORTS.map((sort) => (
          <ChoiceOptionRow
            key={sort}
            value={sort}
            label={t(`affiliates.sort.${sort}`)}
            selected={draft.sort === sort}
            colors={colors}
            onSelect={() => setDraft((current) => ({ ...current, sort }))}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('filters.apply')}
        onPress={apply}
        style={({ pressed }) => [styles.applyButton, pressed && styles.applyPressed]}
      >
        <Text style={styles.applyText}>{t('filters.apply')}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.lg,
      paddingTop: SPACING.xxl,
      paddingHorizontal: SPACING.xl,
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
    applyButton: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      backgroundColor: colors.buttonPrimary,
    },
    applyPressed: {
      opacity: 0.85,
    },
    applyText: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.buttonPrimaryText,
    },
  });
}
