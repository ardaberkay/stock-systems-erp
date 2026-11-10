import FilterChip from '@/components/ui/FilterChip';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

type ChoiceChipsProps<T extends string> = {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
};

// Az seçenekli tekli seçim (teslim şekli, kargoyu ödeyen); hepsi aynı anda görünür
export default function ChoiceChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceChipsProps<T>) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.field} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    field: {
      gap: SPACING.xs,
    },
    label: {
      ...typography.label,
      color: colors.textSecondary,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
  });
}
