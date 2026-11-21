import { useOrders } from '@/features/orders/api/orders';
import type { ReportPatternSpan } from '@/features/reports/constants';
import { getPatternRange, getPatternStats } from '@/features/reports/utils/reportPattern';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useMemo } from 'react';

// Gün deseni raporlarının verisi. "Bu hafta" son 7 günlük önbellekten süzülür, ek istek
// atılmaz; "Son 4 hafta" 28 günlük tek istek atar. Kapalıyken (enabled false) hiç istemez.
export function useReportPattern(span: ReportPatternSpan, enabled: boolean) {
  const { now } = useCurrentTime();
  const range = useMemo(() => getPatternRange(span, now), [span, now]);
  const query = useOrders(range, { enabled });
  const orders = query.data;
  const pattern = useMemo(
    () => (orders ? getPatternStats(orders, span, now) : null),
    [orders, span, now],
  );

  return { pattern, error: query.error };
}
