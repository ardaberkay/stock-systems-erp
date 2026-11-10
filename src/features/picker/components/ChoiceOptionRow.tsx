import type { PickerValue } from '@/features/picker/pickerStore';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { memo, useMemo, type ReactNode } from 'react';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type ChoiceOptionRowProps = {
  value: PickerValue;
  label: string;
  selected: boolean;
  disabled?: boolean;
  // Pasif satırda nedeni (ör. "Uygulamadan seçilemiyor")
  badge?: string;
  // Yazı yerine özel görünüm (ör. durum rozeti); label yine ekran okuyucuda kullanılır
  content?: ReactNode;
  colors: AppColors;
  onSelect: (value: PickerValue) => void;
};

const DISABLED_OPACITY = 0.45;

// Kısa listelerin (ödeme tipi, kargo, durum) satırı: her seçenek ayrı kutu. Seçili olan turuncu
// çerçeve, açık turuncu zemin ve kalın yazıyla bir bakışta ayrışır.
// Uzun listeler (il, ilçe, ülke) çizgili PickerOptionRow kullanır.
function ChoiceOptionRow({
  value,
  label,
  selected,
  disabled = false,
  badge,
  content,
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
        selected && styles.rowSelected,
        pressed && !selected && styles.rowPressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.main}>
        {content ?? (
          <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
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
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    rowSelected: {
      borderColor: colors.orange,
      backgroundColor: colors.orangeLight,
    },
    rowPressed: {
      borderColor: colors.textDisabled,
    },
    disabled: {
      opacity: DISABLED_OPACITY,
    },
    main: {
      flex: 1,
      alignItems: 'flex-start',
    },
    label: {
      ...typography.body,
      color: colors.text,
    },
    labelSelected: {
      fontFamily: FONT_FAMILY.semiBold,
    },
    badge: {
      ...typography.caption,
      flexShrink: 1,
      textAlign: 'right',
      color: colors.textSecondary,
    },
  });
}
