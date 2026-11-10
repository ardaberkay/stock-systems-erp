import ComingSoonRow from '@/components/ui/form/ComingSoonRow';
import SwitchRow from '@/components/ui/form/SwitchRow';
import TextField from '@/components/ui/form/TextField';
import OrderAddressFields from '@/features/orders/components/create/OrderAddressFields';
import DetailSection from '@/components/ui/DetailSection';
import { EMPTY_BILLING } from '@/features/orders/constants/create';
import type { OrderCreateFormInput } from '@/features/orders/schemas/orderCreate';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export default function OrderCustomerStep() {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<OrderCreateFormInput>();
  const billingDifferent = useWatch({ control, name: 'billingDifferent' });

  return (
    <>
      <DetailSection title={t('orders.create.customer.delivery')}>
        <OrderAddressFields prefix="delivery" />
        <Controller
          control={control}
          name="delivery.email"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.customer.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              hint={t('orders.create.customer.emailHint')}
              error={error?.message ? t(error.message) : undefined}
            />
          )}
        />
      </DetailSection>

      <DetailSection title={t('orders.create.customer.billing')}>
        <SwitchRow
          label={t('orders.create.customer.billingDifferent')}
          hint={t('orders.create.customer.billingDifferentHint')}
          value={billingDifferent}
          onValueChange={(value) => {
            setValue('billingDifferent', value);
            // Kapalıyken fatura alanları doğrulanmaz, gönderimde teslimat bilgileri kopyalanır
            setValue('billing', value ? EMPTY_BILLING : undefined);
          }}
        />
        {billingDifferent ? (
          <>
            <OrderAddressFields prefix="billing" />
            <Controller
              control={control}
              name="billing.taxNumber"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label={t('orders.create.customer.taxNumber')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                />
              )}
            />
            <Controller
              control={control}
              name="billing.taxOffice"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label={t('orders.create.customer.taxOffice')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              )}
            />
          </>
        ) : null}
        {/* API'de TC alanı yok; backend açınca bu satır gerçek alana döner */}
        <ComingSoonRow label={t('orders.create.customer.identityNumber')} />
      </DetailSection>
    </>
  );
}
