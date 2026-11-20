import Badge from '@/components/ui/Badge';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Check from 'lucide-react-native/icons/check';
import type { PickerValue } from '@/features/picker/pickerStore';
import { memo, useMemo } from 'react';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet } from 'react-native';

export type { PickerValue };

type PickerOptionRowProps = {
  value: PickerValue;
  label: string;
  // Satırın sağında küçük ek bilgi (ör. "+90")
  detail?: string;
  selected: boolean;
  disabled?: boolean;
  // Pasif satırda nedenini kısaca söyler (ör. "Yakında")
  badge?: string;
  colors: AppColors;
  onSelect: (value: PickerValue) => void;
};

// 81 il, onlarca ilçe ve 100 ülke listelenir; satırlar yalnızca kendi seçimi değişince yeniden çizilir
function PickerOptionRow({
  value,
  label,
  detail,
  selected,
  disabled = false,
  badge,
  colors,
  onSelect,
}: PickerOptionRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={badge ? `${label}, ${badge}` : label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => onSelect(value)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text
        style={[styles.label, selected && styles.selected, disabled && styles.disabled]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {detail ? <Text style={[styles.detail, disabled && styles.disabled]}>{detail}</Text> : null}
      {badge ? <Badge label={badge} tone="neutral" /> : null}
      {selected ? <Check size={ICON_SIZE.sm} color={colors.iconActive} /> : null}
    </Pressable>
  );
}

export default memo(PickerOptionRow);

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
    selected: {
      fontFamily: FONT_FAMILY.semiBold,
    },
    disabled: {
      color: colors.textDisabled,
    },
    detail: {
      ...typography.label,
      color: colors.textSecondary,
    },
  });
}
