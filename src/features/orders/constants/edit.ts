import type { OrderDetailTab } from '@/features/orders/constants/detail';
import { ORDER_STATUS } from '@/features/orders/constants/status';
import type { OrderEditForm } from '@/features/orders/schemas/orderEdit';
import type { FieldPath } from 'react-hook-form';

// Durum listesindeki sıra. 13, 14 ve 15 görünür ama API "not available" dediği için seçilemez.
export const ORDER_EDIT_STATUSES = [
  ORDER_STATUS.received,
  ORDER_STATUS.approved,
  ORDER_STATUS.notApproved,
  ORDER_STATUS.packing,
  ORDER_STATUS.shipped,
  ORDER_STATUS.delivered,
  ORDER_STATUS.returned,
  ORDER_STATUS.cancelled,
  ORDER_STATUS.partiallyReturned,
  ORDER_STATUS.partiallyCancelled,
];

// Özel durum listesinde "Yok" seçeneği; API'de de 0 özel durumu kaldırır
export const NO_CUSTOM_STATUS = 0;
// Panelde etkin özel durumlar 1 durumundadır
export const ACTIVE_CUSTOM_STATUS = 1;

export const LOCKED_ORDER_STATUSES: readonly number[] = [
  ORDER_STATUS.packing,
  ORDER_STATUS.partiallyReturned,
  ORDER_STATUS.partiallyCancelled,
];

// Hatalı alanın hangi bölümde olduğu; durum özet kartında olduğu için bölümü yok
export const ORDER_EDIT_TAB_FIELDS: Record<OrderDetailTab, (keyof OrderEditForm)[]> = {
  order: ['paymentTypeId', 'shippingFee', 'description', 'description2'],
  customer: ['delivery', 'billing'],
  cargo: ['cargoCompanyId', 'whoPaysShipping'],
};

// order/update hata kodundaki alan ("prepareOrderArgs:billing.taxOffice") → formdaki alan
export const ORDER_EDIT_API_FIELDS: Record<string, FieldPath<OrderEditForm>> = {
  orderStatusId: 'statusId',
  orderCustomStatusId: 'customStatusId',
  orderPaymentTypeId: 'paymentTypeId',
  orderShippingValue: 'shippingFee',
  description: 'description',
  description2: 'description2',
  'delivery.name': 'delivery.firstName',
  'delivery.surName': 'delivery.lastName',
  'delivery.mail': 'delivery.email',
  'delivery.address': 'delivery.address',
  'delivery.city': 'delivery.cityName',
  'delivery.district': 'delivery.districtName',
  'delivery.cargoPlaceOfDelivery': 'delivery.place',
  'delivery.cargoCompanyId': 'cargoCompanyId',
  'delivery.whoPaysShipping': 'whoPaysShipping',
  'billing.name': 'billing.firstName',
  'billing.phone': 'billing.phone',
  'billing.address': 'billing.address',
  'billing.city': 'billing.cityName',
  'billing.district': 'billing.districtName',
  'billing.taxOffice': 'billing.taxOffice',
  'billing.taxNumber': 'billing.taxNumber',
};
