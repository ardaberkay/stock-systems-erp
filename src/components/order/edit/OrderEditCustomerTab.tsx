import ChoiceChips from '@/components/forms/ChoiceChips';
import LockedField from '@/components/forms/LockedField';
import TextField from '@/components/forms/TextField';
import OrderEditAddressFields from '@/components/order/edit/OrderEditAddressFields';
import DetailSection from '@/components/ui/DetailSection';
import { DELIVERY_PLACES } from '@/constants/orderDetail';
import type { OrderEditForm } from '@/schemas/orderEdit';
import type { Order } from '@/schemas/orders';
import { SPACING } from '@/theme/spacing';
import { formatPhone } from '@/utils/formatter';
import { formatPhoneGroups, toTrPhoneDigits } from '@/utils/phone';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type OrderEditCustomerTabProps = {
  // Kilitli alanlar kayıtlı haliyle gösterilir
  order: Order;
};

// "555 123 45 67" biçiminde yazılır: boşluklar dahil en fazla 13 karakter
const PHONE_INPUT_MAX_LENGTH = 13;
// TC 11, vergi no 10 hane
const TAX_NUMBER_MAX_LENGTH = 11;

export default function OrderEditCustomerTab({ order }: OrderEditCustomerTabProps) {
  const { t } = useTranslation();
  const { control } = useFormContext<OrderEditForm>();
  const translateError = (message: string | undefined) => (message ? t(message) : undefined);
  const placeOptions = DELIVERY_PLACES.map((place) => ({
    value: place,
    label: t(`orders.detail.deliveryPlaces.${place}`),
  }));

  return (
    <>
      <DetailSection title={t('orders.detail.sections.customer')}>
        <View style={styles.row}>
          <View style={styles.half}>
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
                />
              )}
            />
          </View>
          <View style={styles.half}>
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
                />
              )}
            />
          </View>
        </View>
        {/* API teslimat telefonunu fatura telefonuna yazıyor; düzelene kadar kilitli */}
        <LockedField
          label={t('orders.detail.phone')}
          value={order.deliveryPhone ? formatPhone(order.deliveryPhone) : null}
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
            />
          )}
        />
        <OrderEditAddressFields prefix="delivery" />
        <Controller
          control={control}
          name="delivery.place"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              label={t('orders.detail.deliveryPlace')}
              value={value}
              options={placeOptions}
              onChange={onChange}
            />
          )}
        />
      </DetailSection>

      <DetailSection title={t('orders.detail.sections.billing')}>
        <View style={styles.row}>
          <View style={styles.half}>
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
                />
              )}
            />
          </View>
          <View style={styles.half}>
            {/* API fatura soyadını telefona yazıyor; düzelene kadar kilitli */}
            <LockedField label={t('orders.create.customer.lastName')} value={order.billingLastName} />
          </View>
        </View>
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
              maxLength={PHONE_INPUT_MAX_LENGTH}
              error={translateError(error?.message)}
            />
          )}
        />
        {/* API fatura e-postasını kabul etmiyor */}
        <LockedField label={t('orders.create.customer.email')} value={order.billingMail} />
      </DetailSection>
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
