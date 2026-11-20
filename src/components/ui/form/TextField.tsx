import FormFieldLayout, { type FieldLayout } from '@/components/ui/form/FormFieldLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import TextInput from '@/components/ui/TextInput';
import { StyleSheet, type TextInputProps } from 'react-native';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  // Çevrilmiş hata metni; varsa çerçeve kırmızı olur
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  // Çok satırlı alan boşken kaç satır yer kaplar; yazdıkça büyür
  minLines?: number;
  editable?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  maxLength?: number;
  // inline: etiket solda, alan sağda (bkz. FormFieldLayout)
  layout?: FieldLayout;
  // Tutarlar sağa yaslanır (bkz. MoneyField); metin sola yaslı yazılır ve kayar
  textAlign?: 'left' | 'right';
};

// Çok satırlı alan varsayılan olarak en az bu kadar satır yüksekliğinde açılır
const MULTILINE_LINES = 3;

export default function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  hint,
  required = false,
  placeholder,
  multiline = false,
  minLines = MULTILINE_LINES,
  editable = true,
  keyboardType,
  autoCapitalize,
  autoComplete,
  maxLength,
  layout = 'stacked',
  textAlign = 'left',
}: TextFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <FormFieldLayout
      label={label}
      required={required}
      layout={layout}
      message={
        error ? (
          <Text style={styles.error}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : null
      }
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        accessibilityLabel={required ? `${label}, ${t('common.required')}` : label}
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
          multiline && [
            styles.multiline,
            { minHeight: typography.body.lineHeight * minLines + SPACING.sm * 2 },
          ],
          textAlign === 'right' && styles.alignRight,
          !editable && styles.disabled,
          error ? styles.inputError : null,
        ]}
      />
    </FormFieldLayout>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
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
    },
    alignRight: {
      textAlign: 'right',
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
