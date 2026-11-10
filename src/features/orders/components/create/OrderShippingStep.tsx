import { useCargoCompanies } from '@/features/orders/api/cargo';
import { useOrderPaymentTypes } from '@/features/orders/api/orders';
import ChoiceChips from '@/components/ui/form/ChoiceChips';
import ComingSoonRow from '@/components/ui/form/ComingSoonRow';
import PickerField, { type PickerOption } from '@/features/picker/components/PickerField';
import SwitchRow from '@/components/ui/form/SwitchRow';
import TextField from '@/components/ui/form/TextField';
import OrderTotalRow from '@/features/orders/components/create/OrderTotalRow';
import DetailSection from '@/components/ui/DetailSection';
import { STORE_PICKUP_CARGO_CODE } from '@/features/orders/constants/detail';
import { DEFAULT_SHIPPING_FEE, NO_SHIPPING_FEE } from '@/features/orders/constants/create';
import { DELIVERY_PLACES, SHIPPING_PAYERS, type ShippingPayer } from '@/features/orders/constants/detail';
import { useLocale } from '@/hooks/useLocale';
import type { OrderCreateFormInput } from '@/features/orders/schemas/orderCreate';
import { formatMoney } from '@/utils/formatter';
import { getItemsTotal } from '@/features/orders/utils/orderCreate';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// Panelde aktif firmalar 1 durumundadır
const ACTIVE_CARGO_STATUS = 1;

export default function OrderShippingStep() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { control, setValue, clearErrors } = useFormContext<OrderCreateFormInput>();
  const chargeShipping = useWatch({ control, name: 'chargeShipping' });
  const whoPaysShipping = useWatch({ control, name: 'whoPaysShipping' });
  const items = useWatch({ control, name: 'items' });
  const cargoQuery = useCargoCompanies();
  const paymentQuery = useOrderPaymentTypes();
  // Karşı ödemelide müşteri kargoyu kuryeye öder; mağaza siparişe ayrıca ücret eklemez
  const isRecipientPaying = whoPaysShipping === 'recipient';

  const cargoOptions = useMemo<PickerOption[]>(
    () =>
      (cargoQuery.data ?? [])
        .filter((company) => company.status === ACTIVE_CARGO_STATUS)
        .map((company) => ({
          value: company.id,
          label:
            company.name === STORE_PICKUP_CARGO_CODE
              ? t('orders.storePickup')
              : company.fullName || company.name,
        })),
    [cargoQuery.data, t],
  );
  const paymentOptions = useMemo<PickerOption[]>(
    () => (paymentQuery.data ?? []).map((type) => ({ value: type.id, label: type.name })),
    [paymentQuery.data],
  );
  const deliveryPlaceOptions = DELIVERY_PLACES.map((place) => ({
    value: place,
    label: t(`orders.detail.deliveryPlaces.${place}`),
  }));
  const payerOptions = SHIPPING_PAYERS.map((payer) => ({
    value: payer,
    label: t(`orders.detail.shippingPayers.${payer}`),
  }));

  const setShippingCharge = (charge: boolean) => {
    setValue('chargeShipping', charge);
    setValue('shippingFee', charge ? DEFAULT_SHIPPING_FEE : NO_SHIPPING_FEE);
    clearErrors('shippingFee');
  };

  const handlePayerChange = (payer: ShippingPayer) => {
    setValue('whoPaysShipping', payer);
    setShippingCharge(payer !== 'recipient');
  };

  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  return (
    <>
      <DetailSection title={t('orders.create.shipping.cargo')}>
        <Controller
          control={control}
          name="cargoCompanyId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('orders.create.shipping.cargoCompany')}
              placeholder={t('orders.create.shipping.selectCargo')}
              searchPlaceholder={t('orders.create.shipping.searchCargo')}
              value={value}
              options={cargoOptions}
              isLoading={cargoQuery.isPending}
              loadError={cargoQuery.error}
              onRetry={() => void cargoQuery.refetch()}
              onChange={(option) => onChange(option.value)}
              searchable={false}
              error={translateError(error?.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="deliveryPlace"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              label={t('orders.create.shipping.deliveryPlace')}
              value={value}
              options={deliveryPlaceOptions}
              onChange={onChange}
            />
          )}
        />
        <ChoiceChips
          label={t('orders.create.shipping.whoPays')}
          value={whoPaysShipping}
          options={payerOptions}
          onChange={handlePayerChange}
        />
        {isRecipientPaying ? null : (
          <>
            <SwitchRow
              label={t('orders.create.shipping.chargeShipping')}
              value={chargeShipping}
              onValueChange={setShippingCharge}
            />
            {chargeShipping ? (
              <Controller
                control={control}
                name="shippingFee"
                render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                  <TextField
                    label={t('orders.create.shipping.shippingFee')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    error={translateError(error?.message)}
                  />
                )}
              />
            ) : null}
          </>
        )}
        <ComingSoonRow label={t('orders.create.shipping.parcelCount')} />
        <ComingSoonRow label={t('orders.create.shipping.transparentBag')} />
      </DetailSection>

      <DetailSection title={t('orders.create.shipping.payment')}>
        <Controller
          control={control}
          name="paymentTypeId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('orders.create.shipping.paymentType')}
              placeholder={t('orders.create.shipping.selectPayment')}
              searchPlaceholder={t('orders.create.shipping.searchPayment')}
              value={value}
              options={paymentOptions}
              isLoading={paymentQuery.isPending}
              loadError={paymentQuery.error}
              onRetry={() => void paymentQuery.refetch()}
              onChange={(option) => onChange(option.value)}
              searchable={false}
              error={translateError(error?.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="paymentConfirmed"
          render={({ field: { value, onChange } }) => (
            <SwitchRow
              label={t('orders.create.shipping.paymentConfirmed')}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="productsValue"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.create.shipping.productsValue')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              placeholder={formatMoney(getItemsTotal(items), locale)}
              hint={t('orders.create.shipping.productsValueHint', {
                value: formatMoney(getItemsTotal(items), locale),
              })}
              error={translateError(error?.message)}
            />
          )}
        />
        {/* Ayrı özet adımı yok; gönderilecek toplam burada görünür */}
        <OrderTotalRow />
      </DetailSection>

      <DetailSection title={t('orders.create.shipping.notes')}>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label={t('orders.create.shipping.description')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              autoCapitalize="sentences"
            />
          )}
        />
        <Controller
          control={control}
          name="description2"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label={t('orders.create.shipping.description2')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              autoCapitalize="sentences"
            />
          )}
        />
      </DetailSection>

      {/* API'de karşılığı olmayan panel alanları; backend açınca gerçek alana dönüşür */}
      <DetailSection title={t('orders.create.shipping.extras')}>
        <ComingSoonRow label={t('orders.create.shipping.partner')} />
        <ComingSoonRow label={t('orders.create.shipping.commission')} />
        <ComingSoonRow label={t('orders.create.shipping.gift')} />
        <ComingSoonRow label={t('orders.create.shipping.giftNote')} />
        <ComingSoonRow label={t('orders.create.shipping.exchange')} />
      </DetailSection>
    </>
  );
}
