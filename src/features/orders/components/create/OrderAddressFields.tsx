import { useCities, useDistricts } from '@/features/orders/api/address';
import PhoneField from '@/features/orders/components/PhoneField';
import PickerField, { type PickerOption } from '@/features/picker/components/PickerField';
import TextField from '@/components/ui/form/TextField';
import type { OrderCreateFormInput } from '@/features/orders/schemas/orderCreate';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
      {/* Ad ve soyad ayrı satırlarda: yan yana düzende ikisi tek satıra sığmaz */}
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
            required
            layout="inline"
          />
        )}
      />
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
            required
            layout="inline"
          />
        )}
      />

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
            required
            layout="inline"
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
            required
            layout="inline"
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
            required
            layout="inline"
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
            minLines={2}
            autoCapitalize="sentences"
            error={translateError(error?.message)}
            required
          />
        )}
      />
    </>
  );
}
