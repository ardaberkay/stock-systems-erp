import PickerOptionRow, { type PickerValue } from '@/components/forms/PickerOptionRow';
import SheetModal from '@/components/forms/SheetModal';
import SearchBar from '@/components/ui/SearchBar';
import StateMessage from '@/components/ui/StateMessage';
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  getPhoneDial,
  type PhoneCountryCode,
} from '@/constants/phoneCountries';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { normalizeText } from '@/utils/productList';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type PhoneFieldProps = {
  label: string;
  country: string;
  onCountryChange: (code: PhoneCountryCode) => void;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
};

type CountryOption = {
  code: PhoneCountryCode;
  label: string;
  dial: string;
};

// Ülke kodu ve boşluklarla yazılabilsin diye biraz pay bırakılır
const PHONE_MAX_LENGTH = 20;

export default function PhoneField({
  label,
  country,
  onCountryChange,
  value,
  onChangeText,
  onBlur,
  error,
}: PhoneFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dial = getPhoneDial(country) || getPhoneDial(DEFAULT_PHONE_COUNTRY);

  // Türkiye ve KKTC en üstte, diğerleri seçili dilin alfabesine göre
  const options = useMemo<CountryOption[]>(() => {
    const all = PHONE_COUNTRIES.map((item) => ({
      code: item.code,
      label: t(`orders.create.countries.${item.code}`),
      dial: item.dial,
    }));
    const [turkey, northCyprus, ...rest] = all;

    return [turkey, northCyprus, ...rest.sort((a, b) => a.label.localeCompare(b.label))];
  }, [t]);

  const visibleOptions = useMemo(() => {
    const normalized = normalizeText(query);
    // "+44", "44" ve "90 392" gibi kod aramaları için artı ve boşluk yok sayılır
    const digits = query.replace(/[+\s]/g, '');

    return normalized
      ? options.filter(
          (option) =>
            normalizeText(option.label).includes(normalized) ||
            (digits !== '' && option.dial.replace(/\s/g, '').startsWith(digits)),
        )
      : options;
  }, [options, query]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const handleSelect = useCallback(
    (selected: PickerValue) => {
      const option = options.find((item) => item.code === selected);

      if (option) {
        onCountryChange(option.code);
      }
      close();
    },
    [options, onCountryChange, close],
  );

  const renderItem = useCallback(
    ({ item }: { item: CountryOption }) => (
      <PickerOptionRow
        value={item.code}
        label={item.label}
        detail={`+${item.dial}`}
        selected={item.code === country}
        colors={colors}
        onSelect={handleSelect}
      />
    ),
    [country, colors, handleSelect],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('orders.create.phoneCountry')}
          accessibilityValue={{ text: `+${dial}` }}
          onPress={() => setIsOpen(true)}
          style={[styles.country, error ? styles.errorBorder : null]}
        >
          <Text style={styles.dial}>{`+${dial}`}</Text>
          <ChevronDown size={ICON_SIZE.sm} color={colors.icon} />
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          accessibilityLabel={label}
          accessibilityHint={error}
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={PHONE_MAX_LENGTH}
          style={[styles.input, error ? styles.errorBorder : null]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <SheetModal visible={isOpen} title={t('orders.create.phoneCountry')} onClose={close}>
        <View style={styles.search}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t('orders.create.searchCountry')}
          />
        </View>
        <FlatList
          data={visibleOptions}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={20}
          ListEmptyComponent={<StateMessage message={t('orders.create.noResults')} />}
        />
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
    row: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    country: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    dial: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    // lineHeight verilmez: iOS'ta yazmaya başlayınca metni aşağı kaydırıyor
    input: {
      flex: 1,
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
    errorBorder: {
      borderColor: colors.error,
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
  });
}
