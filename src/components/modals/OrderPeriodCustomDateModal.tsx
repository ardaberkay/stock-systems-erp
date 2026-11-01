import PeriodRangeForm from '@/components/filters/PeriodRangeForm';
import { useOrderFilterStore } from '@/stores/orderFilterStore';
import { router } from 'expo-router';

// Sipariş dönemi sheet'inin üstüne ikinci bir native sheet olarak açılır.
export default function OrderPeriodCustomDateModal() {
  const selection = useOrderFilterStore((state) => state.selection);
  const setSelection = useOrderFilterStore((state) => state.setSelection);

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
