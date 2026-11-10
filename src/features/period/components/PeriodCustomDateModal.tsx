import PeriodRangeForm from '@/features/period/components/PeriodRangeForm';
import { isPeriodScope, type PeriodScope } from '@/features/period/constants';
import { usePeriodScope } from '@/features/period/usePeriodScope';
import { router, useLocalSearchParams } from 'expo-router';

// Dönem seçim sheet'inin üstüne ikinci bir native sheet olarak açılır.
export default function PeriodCustomDateModal() {
  const { scope } = useLocalSearchParams<{ scope: string }>();

  return isPeriodScope(scope) ? <PeriodCustomDateContent scope={scope} /> : null;
}

function PeriodCustomDateContent({ scope }: { scope: PeriodScope }) {
  const { selection, selectRange } = usePeriodScope(scope);

  return (
    <PeriodRangeForm
      initialRange={
        selection.kind === 'range' ? { from: selection.from, to: selection.to } : undefined
      }
      onApply={(from, to) => {
        selectRange(from, to);
        // Hem bu sheet'i hem altındaki dönem seçim sheet'ini kapatır
        router.dismiss(2);
      }}
    />
  );
}
