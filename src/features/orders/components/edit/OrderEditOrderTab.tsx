import { useOrderPaymentTypes } from '@/features/orders/api/orders';
import LockedField from '@/components/ui/form/LockedField';
import PickerField, { type PickerOption } from '@/features/picker/components/PickerField';
import TextField from '@/components/ui/form/TextField';
import OrderEditItemRow from '@/features/orders/components/edit/OrderEditItemRow';
import Button from '@/components/ui/Button';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { OrderEditForm } from '@/features/orders/schemas/orderEdit';
import type { Order } from '@/features/orders/schemas/orders';
import type { Product } from '@/features/products/schemas/products';
import type { AppColors } from '@/theme/colors';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { parseMoney } from '@/features/orders/utils/orderCreate';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type OrderEditOrderTabProps = {
  order: Order;
  productsById: Map<number, Product>;
  isProductsPending: boolean;
  partnerName: string | undefined;
};

// Pasif butonlar için; basılamadıkları için hiç çağrılmaz
const noop = () => {};

// Okuma halindeki Sipariş bölümüyle aynı düzen; düzenlenebilen satırlar yerinde alana dönüşür
export default function OrderEditOrderTab({
  order,
  productsById,
  isProductsPending,
  partnerName,
}: OrderEditOrderTabProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const locale = useLocale();
  const { control } = useFormContext<OrderEditForm>();
  const shippingFee = useWatch({ control, name: 'shippingFee' });
  const paymentQuery = useOrderPaymentTypes();
  const translateError = (message: string | undefined) => (message ? t(message) : undefined);
  const itemCount = order.items.reduce((total, item) => total + item.qty, 0);
  // Kargo ücreti değiştikçe toplam canlı güncellenir; API de kayıtta aynı hesabı yapıyor
  const total = (order.orderProductsValue ?? 0) + parseMoney(shippingFee);

  const paymentOptions = useMemo<PickerOption[]>(
    () => (paymentQuery.data ?? []).map((type) => ({ value: type.id, label: type.name })),
    [paymentQuery.data],
  );

  return (
    <>
      {/* Sipariş durumu çizelgesi düzenlenemediği için bu modda gösterilmez */}
      <DetailSection
        title={`${t('orders.detail.sections.items')} · ${t('orders.itemCount', {
          value: formatNumber(itemCount, locale),
        })}`}
      >
        {order.items.map((item, index) => (
          <OrderEditItemRow
            key={item.id ?? index}
            item={item}
            product={item.productId === null ? undefined : productsById.get(item.productId)}
            isProductLoading={isProductsPending}
            orderStatusId={order.orderStatusId}
            locale={locale}
          />
        ))}
        {/* API ürün eklemeyi desteklemiyor; yeri hazır, servis gelince bağlanır */}
        <Button label={t('orders.editMode.addItem')} variant="secondary" onPress={noop} disabled />
        <View style={styles.divider} />
        <DetailRow
          label={t('orders.detail.productsTotal')}
          value={
            order.orderProductsValue === null ? null : formatMoney(order.orderProductsValue, locale)
          }
        />
        <Controller
          control={control}
          name="shippingFee"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('orders.detail.shippingFee')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={translateError(error?.message)}
            />
          )}
        />
        <DetailRow label={t('orders.detail.total')} value={formatMoney(total, locale)} emphasized />
        <View style={styles.divider} />
        <Controller
          control={control}
          name="paymentTypeId"
          render={({ field: { value, onChange } }) => (
            <PickerField
              label={t('orders.detail.paymentType')}
              placeholder={t('orders.create.shipping.selectPayment')}
              searchPlaceholder={t('orders.create.shipping.searchPayment')}
              value={value}
              options={paymentOptions}
              isLoading={paymentQuery.isPending}
              loadError={paymentQuery.error}
              onRetry={() => void paymentQuery.refetch()}
              onChange={(option) => onChange(option.value)}
              searchable={false}
            />
          )}
        />
        <DetailRow
          label={t('orders.detail.paymentConfirm')}
          value={order.orderPaymentConfirm === 1 ? t('orders.detail.paymentConfirmed') : null}
        />
        <LockedField label={t('orders.detail.partner')} value={partnerName} />
      </DetailSection>

      <DetailSection title={t('orders.detail.sections.notes')}>
        {/* Dış no hiçbir zaman değiştirilemez; kilit işareti gerekmez */}
        <DetailRow label={t('orders.detail.externalId')} value={order.customOrderId} selectable />
        <View style={styles.divider} />
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label={t('orders.detail.description')}
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
              label={t('orders.detail.description2')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              autoCapitalize="sentences"
            />
          )}
        />
      </DetailSection>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
  });
}
