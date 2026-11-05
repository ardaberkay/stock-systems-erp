// API'nin döndürdüğü kod değerleri; görünen metin `orders.detail.<alan>.<kod>` çevirisinden gelir.
// Değerler order/add dokümanından: kargoyu ödeyen 'recipient' / 'sender', teslim yeri 'home' / 'branch'.
// Listede olmayan bir kod "Belirtilmemiş" olarak görünür, ham kod kullanıcıya gösterilmez.
export const SHIPPING_PAYERS = ['sender', 'recipient'] as const;
export const DELIVERY_PLACES = ['home', 'branch'] as const;

export type ShippingPayer = (typeof SHIPPING_PAYERS)[number];
export type DeliveryPlace = (typeof DELIVERY_PLACES)[number];

export function isShippingPayer(value: string | null | undefined): value is ShippingPayer {
  return SHIPPING_PAYERS.some((payer) => payer === value);
}

export function isDeliveryPlace(value: string | null | undefined): value is DeliveryPlace {
  return DELIVERY_PLACES.some((place) => place === value);
}
