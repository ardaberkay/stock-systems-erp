import PeriodSelectSheet from '@/components/filters/PeriodSelectSheet';
import { ORDER_PERIODS } from '@/constants/orderFilters';
import { useOrderFilterStore } from '@/stores/orderFilterStore';

export default function OrderPeriodModal() {
  const selection = useOrderFilterStore((state) => state.selection);
  const setSelection = useOrderFilterStore((state) => state.setSelection);

  return (
    <PeriodSelectSheet
      periods={ORDER_PERIODS}
      selection={selection}
      onSelect={(period) => setSelection({ kind: 'preset', period })}
      customDateHref="/order-period-custom"
    />
  );
}
