import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Check from 'lucide-react-native/icons/check';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type PickerValue = string | number;

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
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
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
    pressed: {
      backgroundColor: colors.surface,
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
    badge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: RADIUS.full,
      backgroundColor: colors.border,
    },
    badgeText: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
  });
}
