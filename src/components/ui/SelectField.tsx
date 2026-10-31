import AnimatedChevron from '@/components/ui/AnimatedChevron';
import Collapsible from '@/components/ui/Collapsible';
import FilterChip from '@/components/ui/FilterChip';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

// Uzun seçenek listelerini kapalı tutar: satıra basınca açılır, seçince kapanır.
export default function SelectField({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: SelectFieldProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: isOpen }}
        accessibilityValue={{ text: selected?.label }}
        onPress={onToggle}
        style={styles.row}
      >
        <Text style={styles.label}>{label}</Text>

        <View style={styles.value}>
          <Text style={styles.valueText} numberOfLines={1}>
            {selected?.label}
          </Text>
          <AnimatedChevron expanded={isOpen} color={colors.icon} />
        </View>
      </Pressable>

      <Collapsible expanded={isOpen}>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {options.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={option.value === value}
              onPress={() => onSelect(option.value)}
            />
          ))}
        </View>
      </Collapsible>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    label: {
      ...typography.body,
      color: colors.text,
    },
    value: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
    },
    valueText: {
      ...typography.label,
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.medium,
      flexShrink: 1,
    },
    options: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      paddingBottom: SPACING.md,
    },
  });
}
