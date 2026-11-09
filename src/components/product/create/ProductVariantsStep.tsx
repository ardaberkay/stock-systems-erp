import { useColors } from '@/api/catalog';
import ComingSoonRow from '@/components/forms/ComingSoonRow';
import PickerField from '@/components/forms/PickerField';
import TextField from '@/components/forms/TextField';
import VariantRow from '@/components/product/create/VariantRow';
import Button from '@/components/ui/Button';
import DetailSection from '@/components/ui/DetailSection';
import { createEmptyVariant } from '@/constants/productCreate';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ProductCreateFormInput } from '@/schemas/productCreate';
import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { toSortedOptions } from '@/utils/catalog';
import { useMemo } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

// 3. adım: renk, model kodu ve varyantlar. Her renk ayrı üründür; bu form bir rengi oluşturur.
export default function ProductVariantsStep() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { control, formState } = useFormContext<ProductCreateFormInput>();
  const { fields, append, remove } = useFieldArray({ control, name: 'variants', keyName: 'fieldKey' });
  const colorQuery = useColors();
  const colorOptions = useMemo(() => toSortedOptions(colorQuery.data ?? []), [colorQuery.data]);
  // Liste boş kalırsa hata dizinin kendisinde durur
  const variantsError = formState.errors.variants?.root?.message ?? formState.errors.variants?.message;

  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  return (
    <>
      <DetailSection title={t('stock.create.sections.color')}>
        <Controller
          control={control}
          name="colorId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('stock.create.fields.color')}
              placeholder={t('stock.create.fields.selectColor')}
              searchPlaceholder={t('stock.create.fields.searchColor')}
              value={value}
              options={colorOptions}
              isLoading={colorQuery.isPending}
              loadError={colorQuery.error}
              onRetry={() => void colorQuery.refetch()}
              onChange={(option) => onChange(option.value)}
              required
              error={translateError(error?.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="modelCode"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('stock.create.fields.modelCode')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
              required
              hint={t('stock.create.fields.modelCodeHint')}
              error={translateError(error?.message)}
            />
          )}
        />
        {/* API yalnızca internet adresindeki görseli kabul ediyor; yükleme servisi bekleniyor */}
        <ComingSoonRow label={t('stock.create.fields.images')} />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.variants')}>
        {fields.map((field, index) => (
          <VariantRow
            key={field.fieldKey}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
        {variantsError ? <Text style={styles.error}>{t(variantsError)}</Text> : null}
        <Button
          label={t('stock.create.fields.addVariant')}
          variant="secondary"
          onPress={() => append(createEmptyVariant())}
        />
      </DetailSection>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    error: {
      ...typography.caption,
      color: colors.error,
    },
  });
}
