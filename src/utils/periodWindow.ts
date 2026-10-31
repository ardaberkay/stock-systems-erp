import type { PeriodSelection } from '@/constants/periods';
import { MAX_RANGE_DAYS } from '@/constants/periods';
import { addDays, countDays, toDayKey, toTurkeyDateTime } from '@/utils/dateKey';

export type DayRange = {
  startDay: string;
  // Dahil; API'ye giderken ertesi güne çevrilir.
  endDay: string;
};

export type ChartGranularity = 'hour' | 'day';

export type PeriodWindow = {
  range: DayRange;
  previousRange: DayRange;
  granularity: ChartGranularity;
  // Bugün bitmediği için önceki dönem de aynı saate kadar sayılır; değilse null.
  previousCutoff: string | null;
  // Saatlik grafikte çizginin biteceği saat; sonrası henüz gelmemiştir.
  lastHour: number;
  // Dönem bugünü içeriyorsa son nokta henüz tamamlanmamıştır.
  isPartial: boolean;
};

function getRange(selection: PeriodSelection, today: string): DayRange {
  if (selection.kind === 'range') {
    return { startDay: toDayKey(selection.from), endDay: toDayKey(selection.to) };
  }

  switch (selection.period) {
    case 'today':
      return { startDay: today, endDay: today };
    case 'yesterday':
      return { startDay: addDays(today, -1), endDay: addDays(today, -1) };
    case 'weekly':
      return { startDay: addDays(today, -6), endDay: today };
    case 'monthly':
      return { startDay: addDays(today, -(MAX_RANGE_DAYS - 1)), endDay: today };
  }
}

export function resolvePeriodWindow(selection: PeriodSelection, now: Date): PeriodWindow {
  const nowInTurkey = toTurkeyDateTime(now);
  const today = nowInTurkey.slice(0, 10);
  const currentTime = nowInTurkey.slice(11);

  const range = getRange(selection, today);
  const days = countDays(range.startDay, range.endDay);
  const previousRange = {
    startDay: addDays(range.startDay, -days),
    endDay: addDays(range.endDay, -days),
  };
  const includesToday = range.endDay === today;

  return {
    range,
    previousRange,
    granularity: days === 1 ? 'hour' : 'day',
    previousCutoff: includesToday ? `${previousRange.endDay} ${currentTime}` : null,
    lastHour: includesToday ? Number(currentTime.slice(0, 2)) : 23,
    isPartial: includesToday,
  };
}
