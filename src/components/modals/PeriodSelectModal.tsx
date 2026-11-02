import PeriodSelectSheet from '@/components/filters/PeriodSelectSheet';
import { PERIODS } from '@/constants/periods';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';

export default function PeriodSelectModal() {
  const selection = useDashboardFilterStore((state) => state.selection);
  const setSelection = useDashboardFilterStore((state) => state.setSelection);

  return (
    <PeriodSelectSheet
      periods={PERIODS}
      selection={selection}
      onSelect={(period) => setSelection({ kind: 'preset', period })}
      customDateHref="/period-custom"
    />
  );
}
