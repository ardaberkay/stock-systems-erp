import { useCities, useDistricts } from '@/api/address';
import PhoneField from '@/components/forms/PhoneField';
import PickerField, { type PickerOption } from '@/components/forms/PickerField';
import TextField from '@/components/forms/TextField';
import type { OrderCreateFormInput } from '@/schemas/orderCreate';
import { SPACING } from '@/theme/spacing';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type OrderAddressFieldsProps = {
  // Teslimat ve fatura aynı alanları kullanır
  prefix: 'delivery' | 'billing';
};

export default function OrderAddressFields({ prefix }: OrderAddressFieldsProps) {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<OrderCreateFormInput>();
  const cityId = useWatch({ control, name: `${prefix}.cityId` }) ?? null;
  const phoneCountry = useWatch({ control, name: `${prefix}.phoneCountry` }) ?? '';
  const citiesQuery = useCities();
  const districtsQuery = useDistricts(cityId);

  // Adlar API'de büyük harfle gelir; liste Türkçe alfabeye göre sıralanır
  const cityOptions = useMemo<PickerOption[]>(
    () =>
      (citiesQuery.data ?? [])
        .map((city) => ({ value: city.id, label: city.cityName }))
        .sort((a, b) => a.label.localeCompare(b.label, 'tr')),
    [citiesQuery.data],
  );
  const districtOptions = useMemo<PickerOption[]>(
    () =>
      (districtsQuery.data ?? [])
        .map((district) => ({ value: district.id, label: district.name }))
        .sort((a, b) => a.label.localeCompare(b.label, 'tr')),
    [districtsQuery.data],
  );

  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  return (
    <>
      <View style={styles.row}>
        <View style={styles.half}>
          <Controller
            control={control}
            name={`${prefix}.firstName`}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label={t('orders.create.customer.firstName')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                error={translateError(error?.message)}
              />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name={`${prefix}.lastName`}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label={t('orders.create.customer.lastName')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                error={translateError(error?.message)}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name={`${prefix}.phone`}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <PhoneField
            label={t('orders.create.customer.phone')}
            country={phoneCountry}
            onCountryChange={(code) => setValue(`${prefix}.phoneCountry`, code)}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={translateError(error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name={`${prefix}.cityId`}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <PickerField
            label={t('orders.create.customer.city')}
            placeholder={t('orders.create.customer.selectCity')}
            searchPlaceholder={t('orders.create.customer.searchCity')}
            value={value ?? null}
            options={cityOptions}
            isLoading={citiesQuery.isPending}
            loadError={citiesQuery.error}
            onRetry={() => void citiesQuery.refetch()}
            onChange={(option) => {
              if (option.value === value) return;
              onChange(option.value);
              // İl değişince eski ilçe geçersizdir
              setValue(`${prefix}.cityName`, option.label);
              setValue(`${prefix}.districtName`, '');
            }}
            error={translateError(error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name={`${prefix}.districtName`}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <PickerField
            label={t('orders.create.customer.district')}
            placeholder={t('orders.create.customer.selectDistrict')}
            searchPlaceholder={t('orders.create.customer.searchDistrict')}
            // Formda ilçe adı tutulur (API ad bekler); seçili satır adından bulunur
            value={districtOptions.find((option) => option.label === value)?.value ?? null}
            selectedLabel={value ?? ''}
            options={districtOptions}
            disabled={cityId === null}
            disabledHint={t('orders.create.customer.selectCityFirst')}
            isLoading={districtsQuery.isPending}
            loadError={districtsQuery.error}
            onRetry={() => void districtsQuery.refetch()}
            onChange={(option) => onChange(option.label)}
            error={translateError(error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name={`${prefix}.address`}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <TextField
            label={t('orders.create.customer.address')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            autoCapitalize="sentences"
            error={translateError(error?.message)}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  half: {
    flex: 1,
  },
});
