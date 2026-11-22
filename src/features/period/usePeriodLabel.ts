import type { PeriodSelection } from '@/features/period/constants';
import { useLocale } from '@/hooks/useLocale';
import { formatDateRange, formatShortDateRange } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

type PeriodLabelOptions = {
  // Dönem seçicide görünen kısa ad: "30 Gün", "12–18 Eki"
  short?: boolean;
};

// Seçili dönemin görünen adı: "Son 7 gün" veya "12 Eki – 18 Eki 2026"
export function usePeriodLabel(
  selection: PeriodSelection<string>,
  { short = false }: PeriodLabelOptions = {},
) {
  const { t } = useTranslation();
  const locale = useLocale();

  if (selection.kind === 'preset') {
    return short ? t(`filters.short.${selection.period}`) : t(`filters.${selection.period}`);
  }

  return short
    ? formatShortDateRange(selection.from, selection.to, locale)
    : formatDateRange(selection.from, selection.to, locale);
}
