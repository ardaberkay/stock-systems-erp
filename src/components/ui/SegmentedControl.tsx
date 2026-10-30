import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import type { LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        const contentColor = active ? colors.chipActiveText : colors.chipInactiveText;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (!active) {
                onChange(option.value);
              }
            }}
            style={[styles.option, active && styles.optionActive]}
          >
            {Icon && <Icon size={ICON_SIZE.sm} color={contentColor} />}
            <Text style={[styles.label, { color: contentColor }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: SPACING.xxs,
      padding: SPACING.xxs,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.chipBorder,
      backgroundColor: colors.chipInactive,
    },
    option: {
      flex: 1,
      minHeight: MIN_TOUCH_SIZE - SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.sm,
    },
    optionActive: {
      backgroundColor: colors.chipActive,
    },
    label: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}
