import type { AppColors } from '@/theme/colors';
import { formatMoney, formatNumber } from '@/utils/formatter';

// Ortak raporundaki rakamlar; biri seçilince grafik onu çizer
export const AFFILIATE_SALES_METRICS = ['revenue', 'orders', 'sold'] as const;
export type AffiliateSalesMetric = (typeof AFFILIATE_SALES_METRICS)[number];

// Renkler anasayfa grafiğindekiyle aynı: ciro turuncu, sipariş yeşil, adet mor
export function getSalesMetricColor(metric: AffiliateSalesMetric, colors: AppColors): string {
  switch (metric) {
    case 'revenue':
      return colors.orange;
    case 'orders':
      return colors.green;
    case 'sold':
      return colors.purple;
  }
}

export function formatSalesMetric(
  metric: AffiliateSalesMetric,
  value: number,
  locale: string,
): string {
  return metric === 'revenue' ? formatMoney(value, locale) : formatNumber(value, locale);
}
