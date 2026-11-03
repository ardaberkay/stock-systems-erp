import type { PeriodSelection } from '@/constants/periods';

// Görünen adlar `reports.<anahtar>.title` çevirisinden gelir.
// Sıra, mağaza sahibinin ne sıklıkla bakacağına göredir: her gün bakılanlar üstte,
// ara sıra bakılan analizler altta. Aynı türden grafik mümkün olduğunca art arda gelmez.
export const REPORT_IDS = [
  'profit',
  'orderStatus',
  'returns',
  'stock',
  'topProducts',
  'unsold',
  'customers',
  'partners',
  'payment',
  'brands',
  'cities',
  'busyHours',
  'weekdays',
] as const;

export type ReportId = (typeof REPORT_IDS)[number];

export const REPORT_CATEGORIES = ['all', 'sales', 'orders', 'products', 'customers'] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

// Satış: ne kadar para girdi, nereden geldi. Siparişler: ne durumda, ne zaman geliyor.
// Ürünler: ne satıyor, ne bekliyor. Müşteriler: kim alıyor, nereden alıyor.
export const REPORT_CATEGORY_BY_ID: Record<ReportId, Exclude<ReportCategory, 'all'>> = {
  profit: 'sales',
  payment: 'sales',
  partners: 'sales',
  orderStatus: 'orders',
  returns: 'orders',
  busyHours: 'orders',
  weekdays: 'orders',
  topProducts: 'products',
  brands: 'products',
  stock: 'products',
  unsold: 'products',
  customers: 'customers',
  cities: 'customers',
};

// Grafiği sayılardan ibaret raporlar küçük kart olarak kalır
export const REPORT_SMALL_IDS: readonly ReportId[] = ['returns', 'unsold', 'partners'];

// Ürünlerin bugünkü durumunu gösterir, API geçmiş stok vermez; dönem seçici rakamı değiştirmez
export const REPORT_SNAPSHOT_IDS: readonly ReportId[] = ['stock'];

// Stok detayında çubuğa dokununca liste bu gruba süzülür; ilk açılışta tükenenler gelir
export const REPORT_STOCK_GROUPS = ['out', 'low', 'healthy'] as const;

export type ReportStockGroup = (typeof REPORT_STOCK_GROUPS)[number];

// Kartlar her zaman bu dönemi gösterir; dönem yalnızca detayda değişir.
export const REPORT_DEFAULT_SELECTION: PeriodSelection = { kind: 'preset', period: 'weekly' };

export const REPORT_CARD_ROW_LIMIT = 5;
export const REPORT_TOP_PRODUCT_LIMIT = 20;
// Paletteki renk sayısı kadar; fazlası ilk şehrin rengini tekrar eder
export const REPORT_CITY_LIMIT = 7;
export const REPORT_BUSY_SLOT_LIMIT = 5;
// Fazlası tek gri "Diğer" kutusunda toplanır. Detay sınırı paletin gri olmayan renk sayısıdır;
// fazlası rengi tekrar eder ve iki marka aynı görünür.
export const REPORT_BRAND_TILE_LIMIT = 5;
export const REPORT_DETAIL_BRAND_TILE_LIMIT = 6;
export const REPORT_PODIUM_SIZE = 3;
export const REPORT_PODIUM_HEIGHT = 90;
export const REPORT_DETAIL_PODIUM_HEIGHT = 140;
export const REPORT_CUSTOMER_LIMIT = 50;

// Kart gövdeleri sabit yüksekliktedir; sayfa düzenli aksın diye grafik buna sığdırılır
export const REPORT_BODY_HEIGHT = 250;
export const REPORT_SMALL_BODY_HEIGHT = 170;

export const REPORT_BAR_ROW_HEIGHT = 40;
export const REPORT_DIAL_SIZE = 170;
export const REPORT_DETAIL_DIAL_SIZE = 280;
export const REPORT_TREND_HEIGHT = 64;
export const REPORT_DETAIL_TREND_HEIGHT = 180;
export const REPORT_TREEMAP_HEIGHT = 170;
export const REPORT_DETAIL_TREEMAP_HEIGHT = 260;
export const REPORT_COLUMN_HEIGHT = 160;
export const REPORT_DETAIL_COLUMN_HEIGHT = 240;

// 7 güne 12 sütun: telefonda hücreler parmakla okunacak kadar büyük kalır
export const REPORT_HEAT_HOURS_PER_COLUMN = 2;
export const REPORT_HEAT_COLUMNS = 12;
export const REPORT_HEAT_DAYS = 7;

export function isReportId(value: string): value is ReportId {
  return REPORT_IDS.some((id) => id === value);
}
