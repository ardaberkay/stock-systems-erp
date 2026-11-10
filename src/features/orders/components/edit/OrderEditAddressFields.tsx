import { useCities, useDistricts } from '@/features/orders/api/address';
import PickerField, { type PickerOption } from '@/features/picker/components/PickerField';
import TextField from '@/components/ui/form/TextField';
import type { OrderEditForm } from '@/features/orders/schemas/orderEdit';
import { SPACING } from '@/theme/spacing';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type OrderEditAddressFieldsProps = {
  // Teslimat ve fatura aynı alanları kullanır
  prefix: 'delivery' | 'billing';
};

// Siparişte il ve ilçe adla kayıtlı (büyük harf); listede adla eşleştirilir
function sameName(a: string, b: string) {
  return a.toLocaleUpperCase('tr') === b.toLocaleUpperCase('tr');
}

// Adres metni, altında yan yana il ve ilçe seçimi
export default function OrderEditAddressFields({ prefix }: OrderEditAddressFieldsProps) {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<OrderEditForm>();
  const cityName = useWatch({ control, name: `${prefix}.cityName` });
  const citiesQuery = useCities();
  const cityId = citiesQuery.data?.find((city) => sameName(city.cityName, cityName))?.id ?? null;
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
      <Controller
        control={control}
        name={`${prefix}.address`}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <TextField
            label={t('orders.create.customer.address')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            autoCapitalize="sentences"
            error={translateError(error?.message)}
          />
        )}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Controller
            control={control}
            name={`${prefix}.cityName`}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <PickerField
                label={t('orders.create.customer.city')}
                placeholder={t('orders.create.customer.selectCity')}
                searchPlaceholder={t('orders.create.customer.searchCity')}
                value={cityId}
                selectedLabel={value}
                options={cityOptions}
                isLoading={citiesQuery.isPending}
                loadError={citiesQuery.error}
                onRetry={() => void citiesQuery.refetch()}
                onChange={(option) => {
                  if (sameName(option.label, value)) return;
                  onChange(option.label);
                  // İl değişince eski ilçe geçersizdir; ilçe seçilene kadar kayıt engellenir
                  setValue(`${prefix}.districtName`, '', { shouldDirty: true });
                }}
                error={translateError(error?.message)}
              />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name={`${prefix}.districtName`}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <PickerField
                label={t('orders.create.customer.district')}
                placeholder={t('orders.create.customer.selectDistrict')}
                searchPlaceholder={t('orders.create.customer.searchDistrict')}
                value={districtOptions.find((option) => sameName(option.label, value))?.value ?? null}
                selectedLabel={value}
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
        </View>
      </View>
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
