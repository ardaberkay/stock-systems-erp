import ComingSoonRow from '@/components/ui/form/ComingSoonRow';
import MoneyField from '@/components/ui/form/MoneyField';
import PickerField from '@/features/picker/components/PickerField';
import DetailSection from '@/components/ui/DetailSection';
import { TAX_RATES, type ProductBaseFormInput } from '@/features/products/schemas/productCreate';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MoneyFieldName = 'salePrice' | 'listPrice' | 'costPrice' | 'costPrice2';

// 2. adım: fiyat, maliyet ve vergi. Varyanta özel fiyat 3. adımda, varyant satırındadır.
// Düzenlemenin Fiyat bölümü de budur.
export default function ProductPriceStep() {
  const { t } = useTranslation();
  const { control } = useFormContext<ProductBaseFormInput>();
  const taxOptions = TAX_RATES.map((rate) => ({
    value: rate,
    label: t('stock.create.fields.taxRateOption', { value: rate }),
  }));

  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  const renderMoneyField = (name: MoneyFieldName, required = false) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <MoneyField
          label={t(`stock.create.fields.${name}`)}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          required={required}
          error={translateError(error?.message)}
        />
      )}
    />
  );

  return (
    <>
      <DetailSection title={t('stock.create.sections.pricing')}>
        {renderMoneyField('salePrice', true)}
        {renderMoneyField('listPrice')}
        {/* KDV satış fiyatına uygulandığı için onunla aynı bölümde */}
        <Controller
          control={control}
          name="taxRate"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('stock.create.fields.taxRate')}
              placeholder={t('stock.create.fields.selectTaxRate')}
              searchPlaceholder=""
              value={value}
              options={taxOptions}
              onChange={(option) => onChange(option.value)}
              searchable={false}
              required
              error={translateError(error?.message)}
            />
          )}
        />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.costs')}>
        {renderMoneyField('costPrice')}
        {renderMoneyField('costPrice2')}
        <ComingSoonRow label={t('stock.create.fields.procurementDate')} />
      </DetailSection>

      {/* Satış ortağı tarafı uygulamada yönetilmiyor; alanlar backend netleşince açılır */}
      <DetailSection title={t('stock.create.sections.affiliate')}>
        <ComingSoonRow label={t('stock.create.fields.affiliateCommission')} />
        <ComingSoonRow label={t('stock.create.fields.affiliateMaxAdd')} />
      </DetailSection>
    </>
  );
}
