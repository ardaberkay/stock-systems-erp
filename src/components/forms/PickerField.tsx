import { useAppTheme } from '@/hooks/useAppTheme';
import { usePickerSheet } from '@/hooks/usePickerSheet';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export type PickerOption = {
  value: number;
  label: string;
};

type PickerFieldProps = {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  value: number | null;
  // Seçenekler henüz gelmemişken seçili değerin adı (ör. kayıtlı il adı) yine görünür
  selectedLabel?: string;
  options: PickerOption[];
  onChange: (option: PickerOption) => void;
  error?: string;
  disabled?: boolean;
  // Pasifken neden seçilemediği (ör. "Önce il seçin")
  disabledHint?: string;
  isLoading?: boolean;
  loadError?: unknown;
  onRetry?: () => void;
  // Uzun listelerde (il, ilçe) arama kutulu, neredeyse tam boy pencere; kısa listeler
  // (ödeme tipi, kargo firması) aramasız, içerik kadar açılır
  searchable?: boolean;
};

// Satıra basınca native seçim penceresi açılır (bkz. PickerModal). Liste gelmeden pencere açılmaz:
// yüklenirken alanda gösterge döner, hata olursa alanın altında "Tekrar dene" çıkar.
export default function PickerField({
  label,
  placeholder,
  searchPlaceholder,
  value,
  selectedLabel,
  options,
  onChange,
  error,
  disabled = false,
  disabledHint,
  isLoading = false,
  loadError,
  onRetry,
  searchable = true,
}: PickerFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { openPicker } = usePickerSheet();

  const currentLabel =
    options.find((option) => option.value === value)?.label ?? selectedLabel ?? '';
  const isUnavailable = disabled || isLoading || Boolean(loadError);

  const open = () => {
    openPicker(
      {
        title: label,
        items: options,
        value,
        searchPlaceholder,
        onSelect: (selected) => {
          const option = options.find((item) => item.value === selected);

          if (option) {
            onChange(option);
          }
        },
      },
      { searchable },
    );
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: currentLabel || placeholder }}
        accessibilityHint={error ?? (disabled ? disabledHint : undefined)}
        accessibilityState={{ disabled: isUnavailable, busy: isLoading }}
        disabled={isUnavailable}
        onPress={open}
        style={[styles.control, error ? styles.controlError : null]}
      >
        <Text style={[styles.value, !currentLabel && styles.placeholder]} numberOfLines={1}>
          {currentLabel || (disabled && disabledHint ? disabledHint : placeholder)}
        </Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.orange} />
        ) : (
          <ChevronDown size={ICON_SIZE.md} color={isUnavailable ? colors.iconDisabled : colors.icon} />
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {Boolean(loadError) && !isLoading ? (
        <View style={styles.loadError}>
          <Text style={styles.error}>{t(getErrorMessageKey(loadError))}</Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.retry')}
              hitSlop={SPACING.md}
              onPress={onRetry}
            >
              <Text style={styles.retry}>{t('common.retry')}</Text>
            </Pressable>
          ) : null}
        </View>
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
    control: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    controlError: {
      borderColor: colors.error,
    },
    value: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
    placeholder: {
      color: colors.textDisabled,
    },
    error: {
      ...typography.caption,
      flexShrink: 1,
      color: colors.error,
    },
    loadError: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    retry: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.orange,
    },
  });
}
