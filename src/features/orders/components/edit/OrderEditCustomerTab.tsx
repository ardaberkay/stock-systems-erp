import SegmentedField from '@/components/ui/form/SegmentedField';
import LockedField from '@/components/ui/form/LockedField';
import TextField from '@/components/ui/form/TextField';
import OrderEditAddressFields from '@/features/orders/components/edit/OrderEditAddressFields';
import DetailSection from '@/components/ui/DetailSection';
import { DELIVERY_PLACES } from '@/features/orders/constants/detail';
import type { OrderEditForm } from '@/features/orders/schemas/orderEdit';
import type { Order } from '@/features/orders/schemas/orders';
import { formatPhone } from '@/utils/formatter';
import {
  formatPhoneGroups,
  toTrPhoneDigits,
  TR_PHONE_INPUT_MAX_LENGTH,
} from '@/features/orders/utils/phone';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type OrderEditCustomerTabProps = {
  // Kilitli alanlar kayıtlı haliyle gösterilir
  order: Order;
};

// TC 11, vergi no 10 hane
const TAX_NUMBER_MAX_LENGTH = 11;

// Alanlar okuma halindeki gibi yan yana (etiket solda); yalnızca adres alt alta
export default function OrderEditCustomerTab({ order }: OrderEditCustomerTabProps) {
  const { t } = useTranslation();
  const { control } = useFormContext<OrderEditForm>();
  const translateError = (message: string | undefined) => (message ? t(message) : undefined);
  const placeOptions = DELIVERY_PLACES.map((place) => ({
    value: place,
    // Yan yana düzende iki seçenek dar alana sığsın diye kısa adlar
    label: t(`orders.detail.deliveryPlacesShort.${place}`),
  }));

  return (
    <>
      <DetailSection title={t('orders.detail.sections.customer')}>
        <Controller
          control={control}
          name="delivery.firstName"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.customer.firstName')}
              value={value}
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
          name="delivery.lastName"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.customer.lastName')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={translateError(error?.message)}
              required
              layout="inline"
            />
          )}
        />
        {/* API teslimat telefonunu fatura telefonuna yazıyor; düzelene kadar kilitli */}
        <LockedField
          label={t('orders.detail.phone')}
          value={order.deliveryPhone ? formatPhone(order.deliveryPhone) : null}
          layout="inline"
        />
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
              error={translateError(error?.message)}
              layout="inline"
            />
          )}
        />
        <OrderEditAddressFields prefix="delivery" />
        <Controller
          control={control}
          name="delivery.place"
          render={({ field: { value, onChange } }) => (
            <SegmentedField
              label={t('orders.detail.deliveryPlace')}
              value={value}
              options={placeOptions}
              onChange={onChange}
              layout="inline"
            />
          )}
        />
      </DetailSection>

      <DetailSection title={t('orders.detail.sections.billing')}>
        <Controller
          control={control}
          name="billing.firstName"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.customer.firstName')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={translateError(error?.message)}
              required
              layout="inline"
            />
          )}
        />
        {/* API fatura soyadını telefona yazıyor; düzelene kadar kilitli */}
        <LockedField
          label={t('orders.create.customer.lastName')}
          value={order.billingLastName}
          layout="inline"
        />
        {/* Okuma halindeki sırayla aynı: vergi bilgileri, adres, telefon, e-posta */}
        <Controller
          control={control}
          name="billing.taxNumber"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.customer.taxNumber')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              maxLength={TAX_NUMBER_MAX_LENGTH}
              error={translateError(error?.message)}
              layout="inline"
            />
          )}
        />
        <Controller
          control={control}
          name="billing.taxOffice"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.customer.taxOffice')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={translateError(error?.message)}
              layout="inline"
            />
          )}
        />
        <OrderEditAddressFields prefix="billing" />
        <Controller
          control={control}
          name="billing.phone"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.customer.phone')}
              value={formatPhoneGroups(value)}
              onChangeText={(text) => onChange(toTrPhoneDigits(text))}
              onBlur={onBlur}
              placeholder={t('orders.editMode.phonePlaceholder')}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={TR_PHONE_INPUT_MAX_LENGTH}
              error={translateError(error?.message)}
              required
              layout="inline"
            />
          )}
        />
        {/* API fatura e-postasını kabul etmiyor */}
        <LockedField
          label={t('orders.create.customer.email')}
          value={order.billingMail}
          layout="inline"
        />
      </DetailSection>
    </>
  );
}
