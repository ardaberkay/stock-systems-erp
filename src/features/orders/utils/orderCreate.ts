import { ORDER_STATUS } from '@/features/orders/constants/status';
import type { OrderCreateForm, OrderCreateItem } from '@/features/orders/schemas/orderCreate';
import { toApiPhone } from '@/features/orders/utils/phone';

// "1299,90" ve "1299.90" aynı sayıdır; geçersiz metin 0 sayılır (şema zaten engeller)
export function parseMoney(text: string): number {
  const value = Number(text.trim().replace(',', '.'));

  return Number.isFinite(value) ? value : 0;
}

export function getItemsTotal(items: Pick<OrderCreateItem, 'quantity' | 'price'>[]): number {
  return items.reduce((total, item) => total + item.quantity * parseMoney(item.price), 0);
}

// Elle girilen sipariş tutarı varsa o, yoksa ürünlerin toplamı
export function getProductsValue(values: {
  items: Pick<OrderCreateItem, 'quantity' | 'price'>[];
  productsValue: string;
}): number {
  return values.productsValue.trim() === ''
    ? getItemsTotal(values.items)
    : parseMoney(values.productsValue);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

// API tarihi cihazın yerel saatiyle "YYYY-MM-DD HH:MM:SS" bekler
function formatApiDateTime(date: Date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

type PayloadContext = {
  now: Date;
  // Panel boş e-postayı "<saniye>@<sunucu adresi>" diye doldurur; aynısı yapılır
  mailDomain: string;
};

// order/add gövdesi. Dış no ve e-posta API'de zorunlu; boşsa otomatik üretilir.
// Satış ortağı, hediye, şeffaf poşet, parça adedi ve değişim API'de yok; gönderilmez.
export function buildOrderCreatePayload(values: OrderCreateForm, { now, mailDomain }: PayloadContext) {
  const seconds = Math.floor(now.getTime() / 1000);
  const delivery = values.delivery;
  const mail = delivery.email || `${seconds}@${mailDomain}`;
  // Şema numarayı doğruladı; buraya geçersiz numara gelmez
  const deliveryPhone = toApiPhone(delivery.phoneCountry, delivery.phone) ?? '';
  const billing = values.billingDifferent && values.billing ? values.billing : undefined;

  return {
    // "MOB-" uygulamadan açılan siparişi paneldekilerden ayırır
    customOrderId: `MOB-${now.getTime()}`,
    orderDate: formatApiDateTime(now),
    orderStatusId: ORDER_STATUS.received,
    orderPaymentTypeId: values.paymentTypeId,
    orderPaymentConfirmStat: values.paymentConfirmed ? 1 : 0,
    orderProductsValue: getProductsValue(values),
    orderShippingValue: values.chargeShipping ? parseMoney(values.shippingFee) : 0,
    description: values.description,
    // Dokümanda yok ama order/add ve order/update kabul ediyor (test edildi)
    ...(values.description2 ? { description2: values.description2 } : {}),
    delivery: {
      name: delivery.firstName,
      surName: delivery.lastName,
      mail,
      phone: deliveryPhone,
      address: delivery.address,
      city: delivery.cityName,
      district: delivery.districtName,
      cargoCompanyId: values.cargoCompanyId,
      cargoPlaceOfDelivery: values.deliveryPlace,
      whoPaysShipping: values.whoPaysShipping,
    },
    // Panel gibi: fatura farklı değilse teslimat bilgileri faturaya kopyalanır
    billing: billing
      ? {
          name: billing.firstName,
          surName: billing.lastName,
          mail,
          phone: toApiPhone(billing.phoneCountry, billing.phone) ?? '',
          address: billing.address,
          city: billing.cityName,
          district: billing.districtName,
          ...(billing.taxOffice ? { taxOffice: billing.taxOffice } : {}),
          ...(billing.taxNumber ? { taxNumber: billing.taxNumber } : {}),
        }
      : {
          name: delivery.firstName,
          surName: delivery.lastName,
          mail,
          phone: deliveryPhone,
          address: delivery.address,
          city: delivery.cityName,
          district: delivery.districtName,
        },
    items: values.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: parseMoney(item.price),
    })),
  };
}

// "https://test.butiksistem.com/rest" → "test.butiksistem.com"
export function getMailDomain(apiUrl: string): string {
  return apiUrl.match(/^https?:\/\/([^/:]+)/)?.[1] ?? '';
}
