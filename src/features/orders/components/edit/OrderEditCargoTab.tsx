import { useCargoCompanies } from '@/features/orders/api/cargo';
import ChoiceChips from '@/components/ui/form/ChoiceChips';
import PickerField, { type PickerOption } from '@/features/picker/components/PickerField';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import { SHIPPING_PAYERS, STORE_PICKUP_CARGO_CODE } from '@/features/orders/constants/detail';
import { useLocale } from '@/hooks/useLocale';
import type { OrderEditForm } from '@/features/orders/schemas/orderEdit';
import type { Order } from '@/features/orders/schemas/orders';
import { formatNumber } from '@/utils/formatter';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type OrderEditCargoTabProps = {
  order: Order;
};

// Panelde aktif firmalar 1 durumundadır
const ACTIVE_CARGO_STATUS = 1;

// Takip kodu, barkod ve desi kargodan gelir; düzenlenmez, kilit işareti de gerekmez
export default function OrderEditCargoTab({ order }: OrderEditCargoTabProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { control } = useFormContext<OrderEditForm>();
  const cargoQuery = useCargoCompanies();

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
  const payerOptions = SHIPPING_PAYERS.map((payer) => ({
    value: payer,
    label: t(`orders.detail.shippingPayers.${payer}`),
  }));

  return (
    <DetailSection title={t('orders.detail.sections.cargo')}>
      <Controller
        control={control}
        name="cargoCompanyId"
        render={({ field: { value, onChange } }) => (
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
          />
        )}
      />
      {/* Okuma halindeki sırayla aynı; kargoyu ödeyen en altta */}
      <DetailRow label={t('orders.detail.carrier')} value={order.shippingCarrierBranchName} />
      <DetailRow label={t('orders.detail.trackCode')} value={order.shippingTrackCode} selectable />
      <DetailRow label={t('orders.detail.barcode')} value={order.shippingTrackCode2} selectable />
      <DetailRow
        label={t('orders.detail.deci')}
        value={
          order.shippingPackageDeciValue === null
            ? null
            : formatNumber(order.shippingPackageDeciValue, locale)
        }
      />
      <Controller
        control={control}
        name="whoPaysShipping"
        render={({ field: { value, onChange } }) => (
          <ChoiceChips
            label={t('orders.create.shipping.whoPays')}
            value={value}
            options={payerOptions}
            onChange={onChange}
          />
        )}
      />
    </DetailSection>
  );
}
