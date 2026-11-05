import { DEFAULT_PHONE_COUNTRY } from '@/constants/phoneCountries';
import type { OrderCreateFormInput } from '@/schemas/orderCreate';
import type { FieldPath } from 'react-hook-form';

// Görünen adlar `orders.create.steps.<adım>` çevirisinden gelir.
// Son adımın butonu doğrudan siparişi oluşturur; ayrı özet adımı yok.
export const ORDER_CREATE_STEPS = ['products', 'customer', 'shipping'] as const;

export type OrderCreateStep = (typeof ORDER_CREATE_STEPS)[number];

// Bir adımdan geçerken yalnızca o adımın alanları doğrulanır; diğer adımların hataları görünmez.
export const ORDER_CREATE_STEP_FIELDS: Record<
  OrderCreateStep,
  FieldPath<OrderCreateFormInput>[]
> = {
  products: ['items'],
  customer: ['delivery', 'billingDifferent', 'billing'],
  shipping: [
    'cargoCompanyId',
    'deliveryPlace',
    'whoPaysShipping',
    'chargeShipping',
    'shippingFee',
    'paymentTypeId',
    'paymentConfirmed',
    'productsValue',
    'description',
    'description2',
  ],
};

// order/add'in bilinen hata kodları anlaşılır mesaja çevrilir; bilinmeyen kod olduğu gibi gösterilir
export const ORDER_CREATE_ERROR_KEYS: Record<string, string> = {
  'prepareOrderArgs:SomeVariantsSoldOut': 'orders.create.errors.soldOut',
  'prepareOrderArgs:delivery.address': 'orders.create.errors.addressMin',
  'prepareOrderArgs:billing.address': 'orders.create.errors.addressMin',
};

// Kargo ücreti alınmıyorsa API'ye 0 gider
export const NO_SHIPPING_FEE = '0';
// Panelde mağaza ayarından gelen ücret API'de okunamıyor; varsayılan 150 TL, kullanıcı değiştirebilir
export const DEFAULT_SHIPPING_FEE = '150';

export const ORDER_CREATE_DEFAULTS: OrderCreateFormInput = {
  items: [],
  delivery: {
    firstName: '',
    lastName: '',
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    phone: '',
    email: '',
    cityId: null,
    cityName: '',
    districtName: '',
    address: '',
  },
  billingDifferent: false,
  billing: undefined,
  cargoCompanyId: null,
  deliveryPlace: 'home',
  whoPaysShipping: 'sender',
  chargeShipping: true,
  shippingFee: DEFAULT_SHIPPING_FEE,
  paymentTypeId: null,
  paymentConfirmed: false,
  productsValue: '',
  description: '',
  description2: '',
};

// Fatura farklı seçilince alanlar bu değerlerle açılır
export const EMPTY_BILLING: NonNullable<OrderCreateFormInput['billing']> = {
  firstName: '',
  lastName: '',
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  phone: '',
  cityId: null,
  cityName: '',
  districtName: '',
  address: '',
  taxOffice: '',
  taxNumber: '',
};
