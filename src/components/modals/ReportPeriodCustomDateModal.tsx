import PeriodRangeForm from '@/components/filters/PeriodRangeForm';
import { useReportFilterStore } from '@/stores/reportFilterStore';
import { router } from 'expo-router';

export default function ReportPeriodCustomDateModal() {
  const selection = useReportFilterStore((state) => state.selection);
  const setSelection = useReportFilterStore((state) => state.setSelection);

  return (
    <PeriodRangeForm
      initialRange={
        selection.kind === 'range' ? { from: selection.from, to: selection.to } : undefined
      }
      onApply={(from, to) => {
        setSelection({ kind: 'range', from, to });
        // Hem bu sheet'i hem altındaki dönem seçim sheet'ini kapatır
        router.dismiss(2);
      }}
    />
  );
}
