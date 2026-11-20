import FormFieldLayout, { type FieldLayout } from '@/components/ui/form/FormFieldLayout';
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  getPhoneDial,
  type PhoneCountryCode,
} from '@/features/orders/constants/phoneCountries';
import { formatPhoneGroups, toTrPhoneDigits } from '@/features/orders/utils/phone';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePickerSheet } from '@/features/picker/usePickerSheet';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import TextInput from '@/components/ui/TextInput';
import { Pressable, StyleSheet, View } from 'react-native';

type PhoneFieldProps = {
  label: string;
  country: string;
  onCountryChange: (code: PhoneCountryCode) => void;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  // inline: etiket solda, ülke kodu ve numara sağda (bkz. FormFieldLayout)
  layout?: FieldLayout;
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
  required = false,
  layout = 'stacked',
}: PhoneFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { openPicker } = usePickerSheet();
  const dial = getPhoneDial(country) || getPhoneDial(DEFAULT_PHONE_COUNTRY);
  // Türkiye numarası yazarken "(555) 123 45 67" diye gruplanır, formda yalnızca haneler tutulur.
  // Diğer ülkelerin numara düzeni farklı; yazıldığı gibi bırakılır.
  const isTurkey = country === DEFAULT_PHONE_COUNTRY;

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

  // Ülke adıyla ya da "+44", "90 392" gibi kodla aranabilir (bkz. PickerModal)
  const openCountries = () => {
    openPicker(
      {
        title: t('orders.create.phoneCountry'),
        items: options.map((option) => ({
          value: option.code,
          label: option.label,
          detail: `+${option.dial}`,
        })),
        value: country,
        searchPlaceholder: t('orders.create.searchCountry'),
        onSelect: (selected) => {
          const option = options.find((item) => item.code === selected);

          if (option) {
            onCountryChange(option.code);
          }
        },
      },
      { searchable: true },
    );
  };

  return (
    <FormFieldLayout
      label={label}
      required={required}
      layout={layout}
      message={error ? <Text style={styles.error}>{error}</Text> : null}
    >
      {/* Ülke kodu ve numara tek kutuda, ince çizgiyle ayrılır: iki kutunun arasındaki boşluk
          ve çerçeveler kalkınca numara yan yana düzende tek satıra sığar */}
      <View style={[styles.box, error ? styles.errorBorder : null]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('orders.create.phoneCountry')}
          accessibilityValue={{ text: `+${dial}` }}
          onPress={openCountries}
          style={styles.country}
        >
          <Text style={styles.dial}>{`+${dial}`}</Text>
          <ChevronDown size={ICON_SIZE.sm} color={colors.icon} />
        </Pressable>
        <View style={styles.divider} />
        <TextInput
          value={isTurkey ? formatPhoneGroups(toTrPhoneDigits(value)) : value}
          onChangeText={(text) => onChangeText(isTurkey ? toTrPhoneDigits(text) : text)}
          onBlur={onBlur}
          accessibilityLabel={required ? `${label}, ${t('common.required')}` : label}
          accessibilityHint={error}
          keyboardType="phone-pad"
          autoComplete="tel"
          // Türkiye'de de geniş: "+90 555 …" yapıştırılınca kesilmeden gelir, haneler
          // toTrPhoneDigits'te 10'a indirilir
          maxLength={PHONE_MAX_LENGTH}
          style={styles.input}
        />
      </View>
    </FormFieldLayout>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Çerçeve ve köşe diğer giriş kutularıyla aynı (TextField)
    box: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    // Sol iç boşluk diğer kutulardaki metinle aynı hizada; ok ve çizgi tarafı numaraya yer
    // kalsın diye dar
    country: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xxs,
      paddingLeft: SPACING.md,
      paddingRight: SPACING.xs,
    },
    divider: {
      width: 1,
      marginVertical: SPACING.sm,
      backgroundColor: colors.border,
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
      // Çizginin iki yanı eşit: soldaki ok ile çizgi arası (country paddingRight) kadar
      paddingLeft: SPACING.xs,
      paddingRight: SPACING.sm,
      paddingVertical: SPACING.sm,
      color: colors.text,
    },
    errorBorder: {
      borderColor: colors.error,
    },
    error: {
      ...typography.caption,
      color: colors.error,
    },
  });
}
