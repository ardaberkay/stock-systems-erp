import FieldLabel from '@/components/ui/form/FieldLabel';
import type { PickerOption } from '@/features/picker/components/PickerField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePickerSheet } from '@/features/picker/usePickerSheet';
import { usePickerStore, type MultiPickerRequest } from '@/features/picker/pickerStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useEffect, useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type MultiPickerFieldProps = {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  values: number[];
  options: PickerOption[];
  onChange: (values: number[]) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  isLoading?: boolean;
  loadError?: unknown;
  onRetry?: () => void;
};

// Birden fazla seçilebilen alan (ör. kategoriler). Seçilenler alanda virgülle yazılır;
// basınca onay kutulu pencere açılır (bkz. MultiPickerModal).
export default function MultiPickerField({
  label,
  placeholder,
  searchPlaceholder,
  values,
  options,
  onChange,
  hint,
  error,
  required = false,
  isLoading = false,
  loadError,
  onRetry,
}: MultiPickerFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { openMultiPicker } = usePickerSheet();
  const setMultiRequest = usePickerStore((state) => state.setMultiRequest);
  const sourceId = useId();

  const selectedText = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label)
    .join(', ');

  const buildRequest = (): MultiPickerRequest => ({
    sourceId,
    title: label,
    items: options,
    values,
    searchPlaceholder,
    isLoading,
    loadError,
    onRetry,
    onConfirm: (selected) => onChange(selected.filter((value) => typeof value === 'number')),
  });

  // Pencere açıkken liste gelirse pencere de güncellenir
  useEffect(() => {
    if (usePickerStore.getState().multiRequest?.sourceId === sourceId) {
      setMultiRequest(buildRequest());
    }
  });

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={required ? `${label}, ${t('common.required')}` : label}
        accessibilityValue={{ text: selectedText || placeholder }}
        accessibilityHint={error ?? hint}
        onPress={() => openMultiPicker(buildRequest())}
        style={[styles.control, error ? styles.controlError : null]}
      >
        <Text style={[styles.value, !selectedText && styles.placeholder]} numberOfLines={2}>
          {selectedText || placeholder}
        </Text>
        <ChevronDown size={ICON_SIZE.md} color={colors.icon} />
      </Pressable>
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
    control: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
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
    hint: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
