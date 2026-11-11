import { useBrands, useCategories, useProductTypes } from '@/features/products/api/catalog';
import ComingSoonRow from '@/components/ui/form/ComingSoonRow';
import MultiPickerField from '@/features/picker/components/MultiPickerField';
import PickerField from '@/features/picker/components/PickerField';
import SwitchRow from '@/components/ui/form/SwitchRow';
import TextField from '@/components/ui/form/TextField';
import DetailSection from '@/components/ui/DetailSection';
import { CATEGORY_STATUS } from '@/features/products/constants/products';
import type { ProductBaseFormInput } from '@/features/products/schemas/productCreate';
import { getCategoryOptions, toSortedOptions } from '@/features/products/utils/catalog';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// 1. adım: ürünün tüm renklerinde ortak kalan bilgiler. Düzenlemenin Bilgi bölümü de budur.
export default function ProductInfoStep() {
  const { t } = useTranslation();
  const { control } = useFormContext<ProductBaseFormInput>();
  const brandQuery = useBrands();
  const typeQuery = useProductTypes();
  const categoryQuery = useCategories();
  const brandOptions = useMemo(() => toSortedOptions(brandQuery.data ?? []), [brandQuery.data]);
  const typeOptions = useMemo(() => toSortedOptions(typeQuery.data ?? []), [typeQuery.data]);
  const categoryOptions = useMemo(
    () => getCategoryOptions(categoryQuery.data ?? [], CATEGORY_STATUS.active),
    [categoryQuery.data],
  );

  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  return (
    <>
      <DetailSection title={t('stock.create.sections.general')}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('stock.create.fields.name')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="sentences"
              required
              error={translateError(error?.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="brandId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('stock.create.fields.brand')}
              placeholder={t('stock.create.fields.selectBrand')}
              searchPlaceholder={t('stock.create.fields.searchBrand')}
              value={value}
              options={brandOptions}
              isLoading={brandQuery.isPending}
              loadError={brandQuery.error}
              onRetry={() => void brandQuery.refetch()}
              onChange={(option) => onChange(option.value)}
              required
              error={translateError(error?.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label={t('stock.create.fields.description')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              autoCapitalize="sentences"
            />
          )}
        />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.classification')}>
        <Controller
          control={control}
          name="typeId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('stock.create.fields.type')}
              placeholder={t('stock.create.fields.selectType')}
              searchPlaceholder={t('stock.create.fields.searchType')}
              value={value}
              options={typeOptions}
              isLoading={typeQuery.isPending}
              loadError={typeQuery.error}
              onRetry={() => void typeQuery.refetch()}
              onChange={(option) => onChange(option.value)}
              required
              error={translateError(error?.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="categoryIds"
          render={({ field: { value, onChange } }) => (
            <MultiPickerField
              label={t('stock.create.fields.categories')}
              placeholder={t('stock.create.fields.selectCategories')}
              searchPlaceholder={t('stock.create.fields.searchCategories')}
              values={value}
              options={categoryOptions}
              isLoading={categoryQuery.isPending}
              loadError={categoryQuery.error}
              onRetry={() => void categoryQuery.refetch()}
              onChange={onChange}
            />
          )}
        />
        <ComingSoonRow label={t('stock.create.fields.gender')} />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.status')}>
        <Controller
          control={control}
          name="active"
          render={({ field: { value, onChange } }) => (
            <SwitchRow
              label={t('stock.create.fields.active')}
              hint={t('stock.create.fields.activeHint')}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
      </DetailSection>
    </>
  );
}
