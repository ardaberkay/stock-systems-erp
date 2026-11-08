import { ORDER_DETAIL_TABS, isDeliveryPlace, isShippingPayer, type OrderDetailTab } from '@/constants/orderDetail';
import { ORDER_EDIT_API_FIELDS, ORDER_EDIT_TAB_FIELDS } from '@/constants/orderEdit';
import { isApiError } from '@/lib/apiError';
import type { OrderEditForm } from '@/schemas/orderEdit';
import type { Order } from '@/schemas/orders';
import { parseMoney } from '@/utils/orderCreate';
import { toTrPhoneDigits } from '@/utils/phone';
import type { FieldErrors, FieldPath } from 'react-hook-form';

// Formun başlangıcı siparişin kayıtlı hali; değişiklikler buna göre bulunur
export function getOrderEditDefaults(order: Order): OrderEditForm {
  const place = order.deliveryCargoPlaceOfDelivery;
  const payer = order.deliveryWhoPaysShipping;

  return {
    statusId: order.orderStatusId,
    customStatusId: order.orderCustomStatusId,
    paymentTypeId: order.orderPaymentTypeId,
    shippingFee: String(order.orderShippingValue),
    description: order.description ?? '',
    description2: order.description2 ?? '',
    delivery: {
      firstName: order.deliveryFirstName ?? '',
      lastName: order.deliveryLastName ?? '',
      // delivery.mail siparişin ana e-postasını (orderEmail) değiştirir
      email: order.orderEmail ?? '',
      cityName: order.deliveryCity ?? '',
      districtName: order.deliveryDistrict ?? '',
      address: order.deliveryAddress ?? '',
      place: isDeliveryPlace(place) ? place : 'home',
    },
    billing: {
      firstName: order.billingFirstName ?? '',
      phone: toTrPhoneDigits(order.billingPhone ?? ''),
      cityName: order.billingCity ?? '',
      districtName: order.billingDistrict ?? '',
      address: order.billingAddress ?? '',
      taxOffice: order.billingTaxOffice ?? '',
      taxNumber: order.billingTaxNumber ?? '',
    },
    cargoCompanyId: order.shippingCargoCompanyId,
    whoPaysShipping: isShippingPayer(payer) ? payer : 'sender',
  };
}

type ApiFields = Record<string, unknown>;

// Değişen alanları API adıyla ekler. Şema metni kırptığı için kayıtlı değer de kırpılarak
// karşılaştırılır; sonunda boşluk olan eski adres dokunulmadan "değişti" sayılmaz.
function addChanged(target: ApiFields, apiName: string, value: unknown, original: unknown) {
  const before = typeof original === 'string' ? original.trim() : original;

  if (value !== before) {
    target[apiName] = value;
  }
}

// order/update gövdesi; yalnızca değişen alanlar gider. Hiçbir şey değişmediyse null.
// İl ya da ilçe değişince ikisi birlikte gider: ilçe ancak ilinin içinde anlamlı.
export function buildOrderUpdatePayload(values: OrderEditForm, original: OrderEditForm) {
  const update: ApiFields = {};
  const delivery: ApiFields = {};
  const billing: ApiFields = {};

  addChanged(update, 'orderStatusId', values.statusId, original.statusId);
  // API'de 0 özel durumu kaldırır
  if (values.customStatusId !== original.customStatusId) {
    update.orderCustomStatusId = values.customStatusId ?? 0;
  }
  if (values.paymentTypeId !== null) {
    addChanged(update, 'orderPaymentTypeId', values.paymentTypeId, original.paymentTypeId);
  }
  if (parseMoney(values.shippingFee) !== parseMoney(original.shippingFee)) {
    update.orderShippingValue = parseMoney(values.shippingFee);
  }
  addChanged(update, 'description', values.description, original.description);
  addChanged(update, 'description2', values.description2, original.description2);

  const d = values.delivery;
  const od = original.delivery;
  addChanged(delivery, 'name', d.firstName, od.firstName);
  addChanged(delivery, 'surName', d.lastName, od.lastName);
  addChanged(delivery, 'mail', d.email, od.email);
  addChanged(delivery, 'address', d.address, od.address);
  if (d.cityName !== od.cityName.trim() || d.districtName !== od.districtName.trim()) {
    delivery.city = d.cityName;
    delivery.district = d.districtName;
  }
  addChanged(delivery, 'cargoPlaceOfDelivery', d.place, od.place);
  if (values.cargoCompanyId !== null) {
    addChanged(delivery, 'cargoCompanyId', values.cargoCompanyId, original.cargoCompanyId);
  }
  addChanged(delivery, 'whoPaysShipping', values.whoPaysShipping, original.whoPaysShipping);

  const b = values.billing;
  const ob = original.billing;
  addChanged(billing, 'name', b.firstName, ob.firstName);
  addChanged(billing, 'phone', b.phone, ob.phone);
  addChanged(billing, 'address', b.address, ob.address);
  if (b.cityName !== ob.cityName.trim() || b.districtName !== ob.districtName.trim()) {
    billing.city = b.cityName;
    billing.district = b.districtName;
  }
  addChanged(billing, 'taxOffice', b.taxOffice, ob.taxOffice);
  addChanged(billing, 'taxNumber', b.taxNumber, ob.taxNumber);

  if (Object.keys(delivery).length > 0) update.delivery = delivery;
  if (Object.keys(billing).length > 0) update.billing = billing;

  return Object.keys(update).length > 0 ? update : null;
}

// "prepareOrderArgs:billing.taxOffice" veya "prepareOrderArgs:orderStatusId [13] not available"
// → formdaki alan. Alan bilinmiyorsa null.
export function getApiErrorField(error: unknown): FieldPath<OrderEditForm> | null {
  if (!isApiError(error) || typeof error.data !== 'string') {
    return null;
  }
  const apiField = error.data.split(':')[1]?.split(' ')[0];

  return apiField ? (ORDER_EDIT_API_FIELDS[apiField] ?? null) : null;
}

// Alan yolunun ilk parçası bölümlerin alan listesinde aranır
export function getTabOfField(field: string): OrderDetailTab | null {
  const root = field.split('.')[0];

  return ORDER_DETAIL_TABS.find((tab) => ORDER_EDIT_TAB_FIELDS[tab].some((key) => key === root)) ?? null;
}

export function getTabsWithErrors(errors: FieldErrors<OrderEditForm>): OrderDetailTab[] {
  const invalidKeys = Object.keys(errors);

  return ORDER_DETAIL_TABS.filter((tab) =>
    ORDER_EDIT_TAB_FIELDS[tab].some((key) => invalidKeys.includes(key)),
  );
}
