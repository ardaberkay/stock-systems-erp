import { useLocale } from '@/hooks/useLocale';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import { formatDateRange } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

// Seçili dönemin görünen adı: "Son 7 gün" veya "12 Eki – 18 Eki 2026"
export function usePeriodLabel() {
  const { t } = useTranslation();
  const locale = useLocale();
  const selection = useDashboardFilterStore((state) => state.selection);

  return selection.kind === 'preset'
    ? t(`filters.${selection.period}`)
    : formatDateRange(selection.from, selection.to, locale);
}
