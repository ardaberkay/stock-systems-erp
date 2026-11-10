import Checkbox from '@/components/ui/Checkbox';
import type { PickerValue } from '@/features/picker/pickerStore';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { memo, useMemo } from 'react';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet } from 'react-native';

type CheckboxOptionRowProps = {
  value: PickerValue;
  label: string;
  checked: boolean;
  colors: AppColors;
  onToggle: (value: PickerValue) => void;
};

// Çoklu seçim penceresinin satırı; yalnızca kendi seçimi değişince yeniden çizilir
function CheckboxOptionRow({ value, label, checked, colors, onToggle }: CheckboxOptionRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={() => onToggle(value)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Checkbox checked={checked} colors={colors} />
      <Text style={[styles.label, checked && styles.checked]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export default memo(CheckboxOptionRow);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    // Satırlar native sheet'in surface zemininde durur; basılınca zemin rengine döner
    pressed: {
      backgroundColor: colors.background,
    },
    label: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
    checked: {
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}
