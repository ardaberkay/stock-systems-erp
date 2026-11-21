import { getRevenueOrders } from '@/features/orders/utils/orderStats';
import type { Order } from '@/features/orders/schemas/orders';
import type { DayRange } from '@/features/period/periodWindow';
import {
  REPORT_HEAT_DAYS,
  REPORT_PATTERN_WEEKS,
  type ReportPatternSpan,
} from '@/features/reports/constants';
import {
  getBusyGrid,
  getBusySlots,
  getWeekdayCounts,
  getWeekdayIndex,
  type BusySlot,
} from '@/features/reports/utils/reportStats';
import { addDays, toTurkeyDateTime } from '@/utils/dateKey';

export type ReportPattern = {
  orderCount: number;
  // Pazartesiden pazara; değerler toplamdır, ortalama alınmaz
  weekdayCounts: number[];
  busyGrid: number[][];
  busySlots: BusySlot[];
  // Bu haftada bugünün sırası (bitmemiş gün); 4 haftada bugün sayılmadığı için null
  todayIndex: number | null;
};

function getToday(now: Date): string {
  return toTurkeyDateTime(now).slice(0, 10);
}

// Bu hafta: pazartesiden bugüne (gelmemiş günler boş kalır).
// Son 4 hafta: dün biten tam 28 gün; her gün 4 kez geçer, yarım gün girmez.
export function getPatternRange(span: ReportPatternSpan, now: Date): DayRange {
  const today = getToday(now);

  if (span === 'thisWeek') {
    return { startDay: addDays(today, -getWeekdayIndex(today)), endDay: today };
  }

  return {
    startDay: addDays(today, -REPORT_PATTERN_WEEKS * REPORT_HEAT_DAYS),
    endDay: addDays(today, -1),
  };
}

export function getPatternStats(
  orders: Order[],
  span: ReportPatternSpan,
  now: Date,
): ReportPattern {
  const revenueOrders = getRevenueOrders(orders);
  const busyGrid = getBusyGrid(revenueOrders);

  return {
    orderCount: revenueOrders.length,
    weekdayCounts: getWeekdayCounts(revenueOrders),
    busyGrid,
    busySlots: getBusySlots(busyGrid),
    todayIndex: span === 'thisWeek' ? getWeekdayIndex(getToday(now)) : null,
  };
}
