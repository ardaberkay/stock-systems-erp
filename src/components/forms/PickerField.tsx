import PickerOptionRow, { type PickerValue } from '@/components/forms/PickerOptionRow';
import SheetModal from '@/components/forms/SheetModal';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalizeText } from '@/utils/productList';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

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
};

// Uzun ve aranabilir listeler için: satıra basınca arama kutulu bir pencere açılır
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
}: PickerFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const currentLabel =
    options.find((option) => option.value === value)?.label ?? selectedLabel ?? '';
  const visibleOptions = useMemo(() => {
    const normalized = normalizeText(query);

    return normalized
      ? options.filter((option) => normalizeText(option.label).includes(normalized))
      : options;
  }, [options, query]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const handleSelect = useCallback(
    (selected: PickerValue) => {
      const option = options.find((item) => item.value === selected);

      if (option) {
        onChange(option);
      }
      close();
    },
    [options, onChange, close],
  );

  const renderItem = useCallback(
    ({ item }: { item: PickerOption }) => (
      <PickerOptionRow
        value={item.value}
        label={item.label}
        selected={item.value === value}
        colors={colors}
        onSelect={handleSelect}
      />
    ),
    [value, colors, handleSelect],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: currentLabel || placeholder }}
        accessibilityHint={error ?? (disabled ? disabledHint : undefined)}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        style={[styles.control, error ? styles.controlError : null]}
      >
        <Text
          style={[styles.value, !currentLabel && styles.placeholder]}
          numberOfLines={1}
        >
          {currentLabel || (disabled && disabledHint ? disabledHint : placeholder)}
        </Text>
        <ChevronDown size={ICON_SIZE.md} color={disabled ? colors.iconDisabled : colors.icon} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <SheetModal visible={isOpen} title={label} onClose={close}>
        <View style={styles.search}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={searchPlaceholder} />
        </View>
        {isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : loadError ? (
          <StateMessage message={t(getErrorMessageKey(loadError))} onRetry={onRetry} />
        ) : (
          <FlatList
            data={visibleOptions}
            keyExtractor={(item) => String(item.value)}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={<StateMessage message={t('orders.create.noResults')} />}
          />
        )}
      </SheetModal>
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
      color: colors.error,
    },
    search: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
    },
    state: {
      paddingVertical: SPACING.xxxl,
      alignItems: 'center',
    },
  });
}
