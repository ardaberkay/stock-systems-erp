import PeriodSelectSheet from '@/components/filters/PeriodSelectSheet';
import { PERIODS } from '@/constants/periods';
import { useReportFilterStore } from '@/stores/reportFilterStore';

export default function ReportPeriodModal() {
  const selection = useReportFilterStore((state) => state.selection);
  const setSelection = useReportFilterStore((state) => state.setSelection);

  return (
    <PeriodSelectSheet
      periods={PERIODS}
      selection={selection}
      onSelect={(period) => setSelection({ kind: 'preset', period })}
      customDateHref="/report-period-custom"
    />
  );
}
