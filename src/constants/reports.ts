import type { PeriodSelection } from '@/constants/periods';

// Görünen adlar `reports.<anahtar>.title` çevirisinden gelir.
// Sıra, kullanıcının göreceği önem sırasıdır; kart boyutuna göre dizilmez.
export const REPORT_IDS = [
  'profit',
  'orderStatus',
  'returns',
  'topProducts',
  'customers',
  'stock',
  'payment',
  'cities',
  'busyHours',
  'weekdays',
  'unsold',
] as const;

export type ReportId = (typeof REPORT_IDS)[number];

export const REPORT_CATEGORIES = ['all', 'sales', 'orders', 'products', 'customers'] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_CATEGORY_BY_ID: Record<ReportId, Exclude<ReportCategory, 'all'>> = {
  profit: 'sales',
  topProducts: 'sales',
  payment: 'sales',
  orderStatus: 'orders',
  returns: 'orders',
  cities: 'orders',
  busyHours: 'orders',
  weekdays: 'orders',
  stock: 'products',
  unsold: 'products',
  customers: 'customers',
};

// Grafiği sayılardan ibaret raporlar küçük kart olarak kalır
export const REPORT_SMALL_IDS: readonly ReportId[] = ['returns', 'stock', 'unsold'];

// Kartlar her zaman bu dönemi gösterir; dönem yalnızca detayda değişir.
export const REPORT_DEFAULT_SELECTION: PeriodSelection = { kind: 'preset', period: 'weekly' };

export const REPORT_CARD_ROW_LIMIT = 5;
export const REPORT_TOP_PRODUCT_LIMIT = 20;
export const REPORT_CITY_LIMIT = 8;
export const REPORT_BUSY_SLOT_LIMIT = 5;
export const REPORT_PODIUM_SIZE = 3;
export const REPORT_CUSTOMER_LIMIT = 50;

// Kart gövdeleri sabit yüksekliktedir; sayfa düzenli aksın diye grafik buna sığdırılır
export const REPORT_BODY_HEIGHT = 250;
export const REPORT_SMALL_BODY_HEIGHT = 170;

export const REPORT_BAR_ROW_HEIGHT = 40;
export const REPORT_DIAL_SIZE = 170;
export const REPORT_DETAIL_DIAL_SIZE = 280;
export const REPORT_TREND_HEIGHT = 64;
export const REPORT_DETAIL_TREND_HEIGHT = 180;
export const REPORT_COLUMN_HEIGHT = 160;
export const REPORT_DETAIL_COLUMN_HEIGHT = 240;
export const REPORT_PODIUM_HEIGHT = 90;
export const REPORT_DETAIL_PODIUM_HEIGHT = 140;

// 7 güne 12 sütun: telefonda hücreler parmakla okunacak kadar büyük kalır
export const REPORT_HEAT_HOURS_PER_COLUMN = 2;
export const REPORT_HEAT_COLUMNS = 12;
export const REPORT_HEAT_DAYS = 7;

export function isReportId(value: string): value is ReportId {
  return REPORT_IDS.some((id) => id === value);
}
