import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  // Çevrilmiş hata metni; varsa çerçeve kırmızı olur
  error?: string;
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  maxLength?: number;
};

// Çok satırlı alan en az bu kadar satır yüksekliğinde açılır; yazdıkça büyümez, ekran zıplamaz
const MULTILINE_LINES = 3;

export default function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  hint,
  placeholder,
  multiline = false,
  editable = true,
  keyboardType,
  autoCapitalize,
  autoComplete,
  maxLength,
}: TextFieldProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        editable={editable}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.multiline,
          !editable && styles.disabled,
          error ? styles.inputError : null,
        ]}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
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
    // lineHeight verilmez: iOS'ta tek satırlı alanda yazmaya başlayınca metni aşağı kaydırıyor
    input: {
      fontFamily: typography.body.fontFamily,
      fontSize: typography.body.fontSize,
      minHeight: MIN_TOUCH_SIZE,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
    },
    multiline: {
      lineHeight: typography.body.lineHeight,
      minHeight: typography.body.lineHeight * MULTILINE_LINES + SPACING.sm * 2,
    },
    disabled: {
      color: colors.textDisabled,
    },
    inputError: {
      borderColor: colors.error,
    },
    error: {
      ...typography.caption,
      color: colors.error,
    },
    hint: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
