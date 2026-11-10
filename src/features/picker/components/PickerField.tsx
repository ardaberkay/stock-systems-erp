import FieldLabel from '@/components/ui/form/FieldLabel';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePickerSheet } from '@/features/picker/usePickerSheet';
import { usePickerStore, type PickerRequest } from '@/features/picker/pickerStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useEffect, useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

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
  required?: boolean;
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

// Satıra basınca native seçim penceresi açılır (bkz. PickerModal). Liste yüklenirken de açılır;
// gösterge ve "Tekrar dene" pencerenin içinde görünür, form sayfası sade kalır.
export default function PickerField({
  label,
  placeholder,
  searchPlaceholder,
  value,
  selectedLabel,
  options,
  onChange,
  error,
  required = false,
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
  const setRequest = usePickerStore((state) => state.setRequest);
  const sourceId = useId();

  const currentLabel =
    options.find((option) => option.value === value)?.label ?? selectedLabel ?? '';

  const buildRequest = (): PickerRequest => ({
    sourceId,
    title: label,
    items: options,
    value,
    searchPlaceholder,
    isLoading,
    loadError,
    onRetry,
    onSelect: (selected) => {
      const option = options.find((item) => item.value === selected);

      if (option) {
        onChange(option);
      }
    },
  });

  // Pencere açıkken liste gelirse veya hata değişirse pencere de güncellenir
  useEffect(() => {
    if (usePickerStore.getState().request?.sourceId === sourceId) {
      setRequest(buildRequest());
    }
  });

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={required ? `${label}, ${t('common.required')}` : label}
        accessibilityValue={{ text: currentLabel || placeholder }}
        accessibilityHint={error ?? (disabled ? disabledHint : undefined)}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => openPicker(buildRequest(), { searchable })}
        style={[styles.control, error ? styles.controlError : null]}
      >
        <Text style={[styles.value, !currentLabel && styles.placeholder]} numberOfLines={1}>
          {currentLabel || (disabled && disabledHint ? disabledHint : placeholder)}
        </Text>
        <ChevronDown size={ICON_SIZE.md} color={disabled ? colors.iconDisabled : colors.icon} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    field: {
      gap: SPACING.xs,
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
      color: colors.error,
    },
  });
}
