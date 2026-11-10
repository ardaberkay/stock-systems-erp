import PeriodSelectSheet from '@/features/period/components/PeriodSelectSheet';
import { isPeriodScope, type PeriodScope } from '@/features/period/constants';
import { usePeriodScope } from '@/features/period/usePeriodScope';
import { useLocalSearchParams } from 'expo-router';

// Dashboard, siparişler ve raporlar aynı sheet'i kullanır; hangisi için açıldığı `scope` ile gelir.
export default function PeriodSelectModal() {
  const { scope } = useLocalSearchParams<{ scope: string }>();

  return isPeriodScope(scope) ? <PeriodSelectContent scope={scope} /> : null;
}

function PeriodSelectContent({ scope }: { scope: PeriodScope }) {
  const { periods, selection, selectPreset } = usePeriodScope(scope);

  return (
    <PeriodSelectSheet
      periods={periods}
      selection={selection}
      onSelect={selectPreset}
      customDateHref={{ pathname: '/period-custom/[scope]', params: { scope } }}
    />
  );
}
