import Badge from '@/components/ui/Badge';
import type { PickerValue } from '@/features/picker/pickerStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { memo, useMemo, type ComponentType } from 'react';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type ChoiceOptionRowProps = {
  value: PickerValue;
  label: string;
  selected: boolean;
  disabled?: boolean;
  // Pasif satırda nedeni (ör. "Uygulamadan seçilemiyor")
  badge?: string;
  // Yazının solunda kendi renginde ikon (ör. sipariş durumu)
  icon?: ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
  colors: AppColors;
  onSelect: (value: PickerValue) => void;
};

const DISABLED_OPACITY = 0.45;

// Kısa listelerin (ödeme tipi, kargo, durum) satırı: çizgisiz sade satırlar. Seçili olanın
// arkasında nötr gri zemin ve ince çerçeve durur; yazı turuncu ve kalın olur.
// Uzun listeler (il, ilçe, ülke) çizgili PickerOptionRow kullanır.
function ChoiceOptionRow({
  value,
  label,
  selected,
  disabled = false,
  badge,
  icon: Icon,
  iconColor,
  colors,
  onSelect,
}: ChoiceOptionRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={badge ? `${label}, ${badge}` : label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => onSelect(value)}
      style={({ pressed }) => [
        styles.row,
        (selected || pressed) && styles.rowHighlighted,
        selected && styles.rowSelected,
      ]}
    >
      {Icon ? (
        // İkon kendi rengini korur; pasifken yazıyla birlikte soluklaşır
        <View style={disabled && styles.disabledIcon}>
          <Icon size={ICON_SIZE.md} color={iconColor ?? colors.icon} />
        </View>
      ) : null}
      <Text
        style={[styles.label, selected && styles.labelSelected, disabled && styles.disabled]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {badge ? <Badge label={badge} tone="neutral" /> : null}
    </Pressable>
  );
}

export default memo(ChoiceOptionRow);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      // Çerçeve her satırda var ama sheet zemininde görünmez; seçilince satır kaymaz
      borderWidth: 1,
      borderColor: colors.surface,
    },
    // Satırlar native sheet'in surface zemininde durur; seçili ve basılı satır zemin rengini alır
    rowHighlighted: {
      backgroundColor: colors.background,
    },
    rowSelected: {
      borderColor: colors.border,
    },
    disabledIcon: {
      opacity: DISABLED_OPACITY,
    },
    label: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
    labelSelected: {
      color: colors.orange,
      fontFamily: FONT_FAMILY.semiBold,
    },
    disabled: {
      color: colors.textDisabled,
    },
  });
}
