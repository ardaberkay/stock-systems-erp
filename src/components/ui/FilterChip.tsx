import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function FilterChip({ label, active, onPress }: FilterChipProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    chip: {
      minHeight: MIN_TOUCH_SIZE - SPACING.sm,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.chipBorder,
      backgroundColor: colors.chipInactive,
    },
    chipActive: {
      borderColor: colors.chipActive,
      backgroundColor: colors.chipActive,
    },
    label: {
      ...typography.label,
      color: colors.chipInactiveText,
    },
    labelActive: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.chipActiveText,
    },
  });
}
