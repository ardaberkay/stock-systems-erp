import { getOrderStatusDisplay } from '@/constants/orderStatusDisplay';
import {
  REPORT_CARD_ROW_LIMIT,
  REPORT_CITY_LIMIT,
  REPORT_CUSTOMER_LIMIT,
  REPORT_HEAT_HOURS_PER_COLUMN,
  REPORT_PODIUM_SIZE,
  type ReportId,
} from '@/constants/reports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { ReportStats } from '@/hooks/useReportData';
import type { Order } from '@/schemas/orders';
import type { Product } from '@/schemas/products';
import {
  formatDayKey,
  formatMoney,
  formatNumber,
  formatPercent,
  formatPhone,
} from '@/utils/formatter';
import { getOrderStatusToneColors } from '@/utils/orderStatusColor';
import type { BestSeller } from '@/utils/orderStats';
import type { LeaderboardEntry } from 'panelui-native';
import { useTranslation } from 'react-i18next';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const THOUSAND = 1000;

function toOneDecimal(count: number): number {
  return Math.round((count / THOUSAND) * 10) / 10;
}

export type ReportProductSort = 'sold' | 'revenue';

export type ReportRow = {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
  // Dar çubuk grafikte tam metin yerine yazılır
  chartValue?: string;
  color: string;
  // Biri verilirse detay listesi satır yerine bildiğimiz kartı çizer
  bestSeller?: BestSeller;
  product?: Product;
  order?: Order;
  // Müşteri satırı: sıra numarası, telefon ve dokununca sipariş geçmişi
  rank?: number;
  subtitle?: string;
  customer?: { phone: string; name: string };
};

export type ReportTrendPoint = { label: string; value: number };

export type ReportKpi = { key: string; label: string; value: string };

export type ReportCenter = { label: string; value: string; isNegative: boolean };

export type ReportContent = {
  kind: 'bar' | 'column' | 'pie' | 'polar' | 'heat' | 'kpi' | 'leaderboard';
  subtitle: string | null;
  // Rakamı yorumlarken bilinmesi gereken uyarı
  note: string | null;
  isEmpty: boolean;
  // Grafikte çizilenler; detay listesi `rows` ile daha uzun olabilir
  chartRows: ReportRow[];
  // Kartta çizilecek en fazla satır; null ise hepsi çizilir
  cardRowLimit: number | null;
  rows: ReportRow[];
  leaders: LeaderboardEntry[];
  formatLeaderValue: (value: number) => string;
  kpis: ReportKpi[];
  footers: string[];
  center: ReportCenter | null;
  trend: ReportTrendPoint[] | null;
  dayLabels: string[];
};

type ReportSources = {
  stats: ReportStats;
  productsById: Map<number, Product>;
  paymentNames: Map<number, string>;
  isPaymentNamesLoading: boolean;
};

// Her raporun metnini, satırlarını ve renklerini tek yerde kurar; kart ve detay aynısını çizer.
export function useReportContent(
  id: ReportId,
  sources: ReportSources | null,
  productSort: ReportProductSort = 'sold',
): ReportContent | null {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();

  // Adlar siparişle gelmez; beklenmezse her tür aynı adla çizilir ve panelui dilimleri ayıramaz
  if (!sources || (id === 'payment' && sources.isPaymentNamesLoading)) {
    return null;
  }

  const { stats, productsById, paymentNames } = sources;
  const palette = [
    colors.orange,
    colors.blue,
    colors.green,
    colors.purple,
    colors.success,
    colors.error,
    colors.textSecondary,
  ];
  const paletteColor = (index: number) => palette[index % palette.length];
  const money = (value: number) => formatMoney(value, locale);
  const orderText = (value: number) => t('reports.orders', { value: formatNumber(value, locale) });
  const unitText = (value: number) => t('reports.units', { value: formatNumber(value, locale) });
  const dayLabels = DAY_KEYS.map((key) => t(`reports.dayNames.${key}`));

  const base: ReportContent = {
    kind: 'bar',
    subtitle: null,
    note: null,
    isEmpty: false,
    chartRows: [],
    cardRowLimit: null,
    rows: [],
    leaders: [],
    formatLeaderValue: String,
    kpis: [],
    footers: [],
    center: null,
    trend: null,
    dayLabels,
  };

  switch (id) {
    case 'profit': {
      const { revenue, shipping, cost, profit, missingCostCount } = stats.profit;
      const rows = [
        { key: 'cost', label: t('reports.profit.cost'), value: cost, color: colors.blue },
        { key: 'shipping', label: t('reports.profit.shipping'), value: shipping, color: colors.purple },
        { key: 'profit', label: t('reports.profit.profit'), value: profit, color: colors.success },
      ].map((row) => ({ ...row, valueLabel: money(row.value) }));

      return {
        ...base,
        kind: 'pie',
        subtitle: t('reports.profit.subtitle', {
          revenue: money(revenue),
          shipping: money(shipping),
        }),
        note:
          missingCostCount > 0
            ? t('reports.profit.missingCost', { value: formatNumber(missingCostCount, locale) })
            : null,
        isEmpty: revenue === 0,
        chartRows: rows,
        rows: [
          {
            key: 'revenue',
            label: t('reports.profit.revenue'),
            value: revenue,
            valueLabel: money(revenue),
            color: colors.orange,
          },
          ...rows,
        ],
        center: {
          label: t('reports.profit.center'),
          value: money(profit),
          isNegative: profit < 0,
        },
      };
    }

    case 'orderStatus': {
      const rows = stats.statusCounts.map(({ statusId, count }) => {
        const { key, tone } = getOrderStatusDisplay(statusId);

        return {
          key: `status${statusId}`,
          label: t(`orders.status.${key}`),
          value: count,
          valueLabel: orderText(count),
          chartValue: formatNumber(count, locale),
          color: getOrderStatusToneColors(tone, colors).text,
        };
      });

      return {
        ...base,
        subtitle: orderText(stats.orderCount),
        isEmpty: stats.orderCount === 0,
        chartRows: rows,
        cardRowLimit: REPORT_CARD_ROW_LIMIT,
        rows,
      };
    }

    case 'returns': {
      const { returned, cancelled, rate, days, dailyCounts, orders } = stats.returns;

      return {
        ...base,
        kind: 'kpi',
        subtitle: orderText(stats.orderCount),
        isEmpty: stats.orderCount === 0,
        kpis: [
          { key: 'rate', label: t('reports.returns.rate'), value: formatPercent(rate, locale) },
          {
            key: 'total',
            label: `${t('reports.returns.returned')} / ${t('reports.returns.cancelled')}`,
            value: `${formatNumber(returned, locale)} / ${formatNumber(cancelled, locale)}`,
          },
        ],
        trend:
          days.length > 1
            ? days.map((day, index) => ({
                label: formatDayKey(day, locale),
                value: dailyCounts[index],
              }))
            : null,
        rows: [
          {
            key: 'returned',
            label: t('reports.returns.returned'),
            value: returned,
            valueLabel: orderText(returned),
            color: colors.orange,
          },
          {
            key: 'cancelled',
            label: t('reports.returns.cancelled'),
            value: cancelled,
            valueLabel: orderText(cancelled),
            color: colors.error,
          },
          ...orders.map((order) => ({
            key: `order${order.id}`,
            label: '',
            value: 1,
            valueLabel: '',
            color: colors.error,
            order,
          })),
        ],
      };
    }

    case 'topProducts': {
      const isBySold = productSort === 'sold';
      const items = isBySold ? stats.topProducts : stats.topProductsByRevenue;
      const totalSold = items.reduce((sum, item) => sum + item.sold, 0);
      const rows = items.map((item) => ({
        key: `product${item.productId}`,
        label:
          productsById.get(item.productId)?.name ??
          t('reports.productFallback', { id: item.productId }),
        value: isBySold ? item.sold : item.revenue,
        valueLabel: t('reports.soldLine', {
          sold: formatNumber(item.sold, locale),
          revenue: money(item.revenue),
        }),
        chartValue: isBySold ? formatNumber(item.sold, locale) : money(item.revenue),
        color: colors.orange,
        bestSeller: item,
      }));

      return {
        ...base,
        subtitle: unitText(totalSold),
        isEmpty: rows.length === 0,
        chartRows: rows,
        cardRowLimit: REPORT_CARD_ROW_LIMIT,
        rows,
      };
    }

    case 'customers': {
      const { customers } = stats;
      const repeat = customers.filter((customer) => customer.orderCount > 1).length;
      const podium = customers.slice(0, REPORT_PODIUM_SIZE);
      const customerName = (name: string) => name || t('reports.unknown');

      return {
        ...base,
        kind: 'leaderboard',
        subtitle: t('reports.customers.subtitle', {
          total: formatNumber(customers.length, locale),
          repeat: formatNumber(repeat, locale),
        }),
        isEmpty: customers.length === 0,
        leaders: podium.map((customer) => ({
          id: customer.phone,
          name: customerName(customer.name),
          value: customer.orderCount,
          subtitle: formatPhone(customer.phone),
        })),
        formatLeaderValue: orderText,
        rows: customers
          .slice(REPORT_PODIUM_SIZE, REPORT_CUSTOMER_LIMIT)
          .map((customer) => ({
            key: `customer${customer.phone}`,
            label: customerName(customer.name),
            subtitle: formatPhone(customer.phone),
            value: customer.orderCount,
            valueLabel: `${orderText(customer.orderCount)} · ${money(customer.amount)}`,
            color: colors.orange,
            rank: customer.rank,
            customer: { phone: customer.phone, name: customerName(customer.name) },
          })),
      };
    }

    case 'payment': {
      // Hiç kullanılmayan türler de %0 ile görünür; "yok" ile "listelenmemiş" karışmasın
      const usedIds = new Set(stats.paymentShares.map((share) => share.paymentTypeId));
      const unusedShares = [...paymentNames.keys()]
        .filter((paymentTypeId) => !usedIds.has(paymentTypeId))
        .map((paymentTypeId) => ({ paymentTypeId, count: 0, amount: 0 }));
      const rows = [...stats.paymentShares, ...unusedShares].map((share, index) => ({
        key: `payment${share.paymentTypeId}`,
        label:
          share.paymentTypeId === null
            ? t('reports.unknown')
            : (paymentNames.get(share.paymentTypeId) ??
              t('reports.paymentFallback', { id: share.paymentTypeId })),
        value: share.count,
        valueLabel: `${orderText(share.count)} · ${money(share.amount)}`,
        color: paletteColor(index),
      }));

      return {
        ...base,
        kind: 'pie',
        subtitle: orderText(stats.revenueOrderCount),
        isEmpty: stats.revenueOrderCount === 0,
        chartRows: rows,
        rows,
        center: {
          label: t('reports.payment.center'),
          value: formatNumber(stats.revenueOrderCount, locale),
          isNegative: false,
        },
      };
    }

    case 'cities': {
      const rows = stats.cityCounts.map((item, index) => ({
        key: `city${item.city}`,
        label: item.city ?? t('reports.unknown'),
        value: item.count,
        valueLabel: orderText(item.count),
        color: paletteColor(index),
      }));

      return {
        ...base,
        kind: 'polar',
        subtitle: orderText(stats.revenueOrderCount),
        isEmpty: stats.revenueOrderCount === 0,
        chartRows: rows.slice(0, REPORT_CITY_LIMIT),
        cardRowLimit: REPORT_CARD_ROW_LIMIT,
        rows,
      };
    }

    case 'weekdays': {
      const rows = stats.weekdayCounts.map((count, index) => ({
        key: DAY_KEYS[index],
        label: dayLabels[index],
        value: count,
        valueLabel: orderText(count),
        // Dar sütunda yazı küçültülmez; büyük sayı kısalır, tam değer alttaki listededir
        chartValue:
          count >= THOUSAND
            ? t('reports.thousands', { value: formatNumber(toOneDecimal(count), locale) })
            : formatNumber(count, locale),
        color: paletteColor(index),
      }));

      return {
        ...base,
        kind: 'column',
        subtitle: orderText(stats.revenueOrderCount),
        isEmpty: stats.revenueOrderCount === 0,
        chartRows: rows,
        rows,
      };
    }

    case 'busyHours': {
      const rows = stats.busySlots.map((slot) => {
        const start = slot.column * REPORT_HEAT_HOURS_PER_COLUMN;

        return {
          key: `slot${slot.day}-${slot.column}`,
          label: t('reports.busyHours.slotLabel', {
            day: dayLabels[slot.day],
            start: String(start).padStart(2, '0'),
            end: String(start + REPORT_HEAT_HOURS_PER_COLUMN).padStart(2, '0'),
          }),
          value: slot.count,
          valueLabel: orderText(slot.count),
          color: colors.orange,
        };
      });

      return {
        ...base,
        kind: 'heat',
        subtitle: rows[0] ? t('reports.busyHours.subtitle', { slot: rows[0].label }) : null,
        isEmpty: rows.length === 0,
        rows,
      };
    }

    case 'stock': {
      const { totalUnits, stockValue, outOfStock, lowStock } = stats.stock;
      const toRow = (product: Product, color: string): ReportRow => ({
        key: `product${product.id}`,
        label: product.name,
        value: product.stock,
        valueLabel: unitText(product.stock),
        color,
        product,
      });

      return {
        ...base,
        kind: 'kpi',
        subtitle: t('reports.products', { value: formatNumber(productsById.size, locale) }),
        isEmpty: productsById.size === 0,
        kpis: [
          { key: 'units', label: t('reports.stock.units'), value: formatNumber(totalUnits, locale) },
          { key: 'value', label: t('reports.stock.value'), value: money(stockValue) },
          {
            key: 'out',
            label: t('reports.stock.outOfStock'),
            value: formatNumber(outOfStock.length, locale),
          },
          { key: 'low', label: t('reports.stock.lowStock'), value: formatNumber(lowStock.length, locale) },
        ],
        rows: [
          ...outOfStock.map((product) => toRow(product, colors.error)),
          ...lowStock.map((product) => toRow(product, colors.orange)),
        ],
      };
    }

    case 'unsold': {
      const [topWaiting] = stats.unsold;
      const unsoldValue = stats.unsold.reduce(
        (sum, product) => sum + product.stock * product.price,
        0,
      );

      return {
        ...base,
        kind: 'kpi',
        subtitle: t('reports.unsold.subtitle'),
        footers: topWaiting
          ? [
              t('reports.unsold.stockValue', { value: money(unsoldValue) }),
              t('reports.unsold.topWaiting', {
                name: topWaiting.name,
                units: unitText(topWaiting.stock),
              }),
            ]
          : [],
        isEmpty: productsById.size === 0,
        kpis: [
          {
            key: 'products',
            label: t('reports.unsold.products'),
            value: formatNumber(stats.unsold.length, locale),
          },
          {
            key: 'units',
            label: t('reports.unsold.units'),
            value: formatNumber(
              stats.unsold.reduce((sum, product) => sum + product.stock, 0),
              locale,
            ),
          },
        ],
        rows: stats.unsold.map((product) => ({
          key: `product${product.id}`,
          label: product.name,
          value: product.stock,
          valueLabel: unitText(product.stock),
          color: colors.orange,
          product,
        })),
      };
    }
  }
}
