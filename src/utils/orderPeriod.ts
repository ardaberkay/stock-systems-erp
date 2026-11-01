import { MAX_RANGE_DAYS } from '@/constants/periods';
import { ORDER_PAGE_DAYS, type OrderPeriodSelection } from '@/constants/orderFilters';
import { addDays, toDayKey, toTurkeyDateTime } from '@/utils/dateKey';
import type { DayRange } from '@/utils/periodWindow';

export function getOrderRange(selection: OrderPeriodSelection, now: Date): DayRange {
  if (selection.kind === 'range') {
    return { startDay: toDayKey(selection.from), endDay: toDayKey(selection.to) };
  }

  const today = toTurkeyDateTime(now).slice(0, 10);
  const firstOfMonth = `${today.slice(0, 8)}01`;

  switch (selection.period) {
    case 'today':
      return { startDay: today, endDay: today };
    case 'yesterday':
      return { startDay: addDays(today, -1), endDay: addDays(today, -1) };
    case 'weekly':
      return { startDay: addDays(today, -(ORDER_PAGE_DAYS - 1)), endDay: today };
    case 'monthly':
      return { startDay: addDays(today, -(MAX_RANGE_DAYS - 1)), endDay: today };
    case 'thisMonth':
      return { startDay: firstOfMonth, endDay: today };
    case 'lastMonth': {
      const endDay = addDays(firstOfMonth, -1);

      return { startDay: `${endDay.slice(0, 8)}01`, endDay };
    }
  }
}

// Yüklü verinin hemen öncesindeki 7 gün
export function getPreviousOrderPage(range: DayRange): DayRange {
  const endDay = addDays(range.startDay, -1);

  return { startDay: addDays(endDay, -(ORDER_PAGE_DAYS - 1)), endDay };
}
