import { useOrderCustomStatuses, useOrderPaymentTypes } from '@/features/orders/api/orders';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import {
  ACTIVE_CUSTOM_STATUS,
  LOCKED_ORDER_STATUSES,
  NO_CUSTOM_STATUS,
  ORDER_EDIT_STATUSES,
} from '@/features/orders/constants/edit';
import { getOrderStatusDisplay } from '@/features/orders/constants/status';
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
  // Kayıtlı özel durumun adı; liste gelmeden ya da pasif bir durum seçiliyken de görünür
  customStatusName: string | undefined;
};

// Pasif butonlar için; basılamadıkları için hiç çağrılmaz
const noop = () => {};

// Okuma halindeki Sipariş bölümüyle aynı düzen; düzenlenebilen satırlar yerinde alana dönüşür
export default function OrderEditOrderTab({
  order,
  productsById,
  isProductsPending,
  partnerName,
  customStatusName,
}: OrderEditOrderTabProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const locale = useLocale();
  const { control } = useFormContext<OrderEditForm>();
  const shippingFee = useWatch({ control, name: 'shippingFee' });
  const paymentQuery = useOrderPaymentTypes();
  const customStatusQuery = useOrderCustomStatuses();
  const savedCustomStatusId = order.orderCustomStatusId;
  const translateError = (message: string | undefined) => (message ? t(message) : undefined);
  const itemCount = order.items.reduce((total, item) => total + item.qty, 0);
  // Kargo ücreti değiştikçe toplam canlı güncellenir; API de kayıtta aynı hesabı yapıyor
  const total = (order.orderProductsValue ?? 0) + parseMoney(shippingFee);

  const paymentOptions = useMemo<PickerOption[]>(
    () => (paymentQuery.data ?? []).map((type) => ({ value: type.id, label: type.name })),
    [paymentQuery.data],
  );
  // 13, 14 ve 15 listede görünür ama seçilemez; listede durumlar rozetiyle görünür
  const statusOptions = useMemo<PickerOption[]>(
    () =>
      ORDER_EDIT_STATUSES.map((id) => {
        const locked = LOCKED_ORDER_STATUSES.includes(id);

        return {
          value: id,
          label: t(`orders.status.${getOrderStatusDisplay(id).key}`),
          content: <OrderStatusBadge statusId={id} colors={colors} />,
          disabled: locked,
          badge: locked ? t('orders.editMode.statusLocked') : undefined,
        };
      }),
    [colors, t],
  );
  // "Özel durum yok" API'de 0 ile özel durumu kaldırır. Pasif durumlar listede yok; kayıtlı
  // durum pasifse yine görünür ki seçim kaybolmasın.
  const customStatusOptions = useMemo<PickerOption[]>(
    () => [
      { value: NO_CUSTOM_STATUS, label: t('orders.editMode.noCustomStatus') },
      ...(customStatusQuery.data ?? [])
        .filter(
          (status) => status.status === ACTIVE_CUSTOM_STATUS || status.id === savedCustomStatusId,
        )
        .map((status) => ({ value: status.id, label: status.name })),
    ],
    [customStatusQuery.data, savedCustomStatusId, t],
  );

  return (
    <>
      {/* Okumadaki çizelgenin yeri. Çizelge düzenlenemediği için burada durum ve özel durum
          seçilir; başlık kayıtlı durumu gösterir */}
      <DetailSection title={t('orders.detail.sections.timeline')}>
        <Controller
          control={control}
          name="statusId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('orders.detail.status')}
              placeholder=""
              searchPlaceholder=""
              value={value}
              // Düzenlenebilen listede olmayan bir durumdaysa da adı görünür
              selectedLabel={t(`orders.status.${getOrderStatusDisplay(value).key}`)}
              options={statusOptions}
              onChange={(option) => onChange(option.value)}
              searchable={false}
              note={t('orders.editMode.statusStockNote')}
              error={translateError(error?.message)}
              layout="inline"
            />
          )}
        />
        <Controller
          control={control}
          name="customStatusId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PickerField
              label={t('orders.customStatusTitle')}
              placeholder={t('orders.editMode.noCustomStatus')}
              searchPlaceholder=""
              value={value ?? NO_CUSTOM_STATUS}
              selectedLabel={value === savedCustomStatusId ? customStatusName : undefined}
              options={customStatusOptions}
              isLoading={customStatusQuery.isPending}
              loadError={customStatusQuery.error}
              onRetry={() => void customStatusQuery.refetch()}
              onChange={(option) =>
                onChange(option.value === NO_CUSTOM_STATUS ? null : option.value)
              }
              searchable={false}
              // Sunucu reddederse (bkz. showSaveError) alan işaretlenir
              error={translateError(error?.message)}
              layout="inline"
            />
          )}
        />
      </DetailSection>

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
              required
              layout="inline"
              // Tutar: ürün fiyat alanları gibi sağa yaslı
              textAlign="right"
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
              layout="inline"
            />
          )}
        />
        <DetailRow
          label={t('orders.detail.paymentConfirm')}
          value={order.orderPaymentConfirm === 1 ? t('orders.detail.paymentConfirmed') : null}
        />
        <LockedField label={t('orders.detail.partner')} value={partnerName} layout="inline" />
      </DetailSection>

      <DetailSection title={t('orders.detail.sections.notes')}>
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
              minLines={2}
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
              minLines={2}
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
