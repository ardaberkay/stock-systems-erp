import { ORDER_STATUS } from '@/constants/orderStatus';
import type { PeriodSelection } from '@/constants/periods';

// Sipariş dönemleri; görünen ad `filters.<anahtar>` çevirisinden gelir.
// Bu ay ayın 1'inden bugüne, geçen ay önceki ayın tamamını kapsar.
export const ORDER_PERIODS = [
  'today',
  'yesterday',
  'weekly',
  'monthly',
  'thisMonth',
  'lastMonth',
] as const;

export type OrderPeriod = (typeof ORDER_PERIODS)[number];

export type OrderPeriodSelection = PeriodSelection<OrderPeriod>;

export const DEFAULT_ORDER_PERIOD: OrderPeriodSelection = { kind: 'preset', period: 'weekly' };

// Ana sayfa ve siparişlerin ortak kullandığı veri; bu aralıktaki dönemler anında gösterilir.
export const ORDER_BASE_DAYS = 7;

export type OrderFilters = {
  statusIds: number[];
  customStatusId: number | null;
  paymentTypeId: number | null;
  cargoCompanyId: number | null;
  affiliateAccountId: number | null;
};

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  statusIds: [],
  customStatusId: null,
  paymentTypeId: null,
  cargoCompanyId: null,
  affiliateAccountId: null,
};

// "Ödeme Bekliyor" panelde seçilemez, yalnızca API'den gelirse listede gösterilir.
export const ORDER_STATUS_FILTERS = [
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
] as const;
