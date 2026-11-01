import PeriodRangeForm from '@/components/filters/PeriodRangeForm';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import { router } from 'expo-router';

// Dönem seçim sheet'inin üstüne ikinci bir native sheet olarak açılır.
export default function PeriodCustomDateModal() {
  const selection = useDashboardFilterStore((state) => state.selection);
  const setSelection = useDashboardFilterStore((state) => state.setSelection);

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
