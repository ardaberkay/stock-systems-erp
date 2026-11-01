import { useLocale } from '@/hooks/useLocale';
import { useOrderFilterStore } from '@/stores/orderFilterStore';
import { formatDateRange } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

// Seçili sipariş döneminin görünen adı: "Son 7 gün" veya "12 Eki – 18 Eki 2026"
export function useOrderPeriodLabel() {
  const { t } = useTranslation();
  const locale = useLocale();
  const selection = useOrderFilterStore((state) => state.selection);

  return selection.kind === 'preset'
    ? t(`filters.${selection.period}`)
    : formatDateRange(selection.from, selection.to, locale);
}
