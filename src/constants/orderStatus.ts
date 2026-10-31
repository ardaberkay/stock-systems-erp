// Kimlikler web paneldeki sipariş durumlarıyla test edilerek doğrulandı.
export const ORDER_STATUS = {
  paymentPending: 1,
  received: 2,
  approved: 3,
  notApproved: 4,
  shipped: 5,
  delivered: 6,
  returned: 7,
  cancelled: 8,
  partiallyReturned: 13,
  partiallyCancelled: 14,
  packing: 15,
} as const;

// Ciroya giren durumlar; panelle aynı rakamı vermesi için kural yalnızca buradadır.
// Bilinmeyen yeni bir durum, buraya eklenene kadar ciroya sayılmaz.
export const REVENUE_ORDER_STATUSES: readonly number[] = [
  ORDER_STATUS.received,
  ORDER_STATUS.approved,
  ORDER_STATUS.packing,
  ORDER_STATUS.shipped,
  ORDER_STATUS.delivered,
];

// Çok satanlarda sayılmayan ürün satırları. Panelde karşılığı yok, bu bizim kuralımız.
export const NOT_SOLD_ITEM_STATUSES: readonly number[] = [
  ORDER_STATUS.returned,
  ORDER_STATUS.cancelled,
  ORDER_STATUS.partiallyReturned,
];
