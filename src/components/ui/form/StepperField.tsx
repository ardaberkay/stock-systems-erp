import FieldLabel from '@/components/ui/form/FieldLabel';
import Text from '@/components/ui/Text';
import TextInput from '@/components/ui/TextInput';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import Minus from 'lucide-react-native/icons/minus';
import Plus from 'lucide-react-native/icons/plus';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

type StepperFieldProps = {
  label: string;
  // Ham metin; form doğrular. Sayı değilse butonlar 0'dan sayar
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
};

const MIN_VALUE = 0;

function toNumber(text: string): number {
  const value = Number(text.trim());

  return Number.isInteger(value) ? value : MIN_VALUE;
}

// Adet alanı: elle yazılır veya iki yandaki butonla birer birer değişir. Eksi buton 0'da durur.
export default function StepperField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  required = false,
}: StepperFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const current = toNumber(value);
  const canDecrease = current > MIN_VALUE;

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <View style={[styles.box, error ? styles.boxError : null]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${t('common.decrease')}`}
          accessibilityState={{ disabled: !canDecrease }}
          disabled={!canDecrease}
          onPress={() => onChangeText(String(current - 1))}
          style={styles.button}
        >
          <Minus size={ICON_SIZE.sm} color={canDecrease ? colors.icon : colors.iconDisabled} />
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          accessibilityLabel={required ? `${label}, ${t('common.required')}` : label}
          accessibilityHint={error}
          keyboardType="number-pad"
          selectTextOnFocus
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${t('common.increase')}`}
          onPress={() => onChangeText(String(current + 1))}
          style={styles.button}
        >
          <Plus size={ICON_SIZE.sm} color={colors.icon} />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    field: {
      gap: SPACING.xs,
    },
    box: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    boxError: {
      borderColor: colors.error,
    },
    button: {
      width: MIN_TOUCH_SIZE,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // lineHeight verilmez: iOS'ta tek satırlı alanda metni aşağı kaydırıyor
    input: {
      flex: 1,
      minWidth: 0,
      fontFamily: typography.body.fontFamily,
      fontSize: typography.body.fontSize,
      paddingVertical: SPACING.sm,
      textAlign: 'center',
      color: colors.text,
    },
    error: {
      ...typography.caption,
      color: colors.error,
    },
  });
}
