import PeriodPill from '@/components/ui/PeriodPill';
import { usePeriodLabel } from '@/hooks/usePeriodLabel';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import { router } from 'expo-router';

// Dashboard'un seçili dönemini gösterir; dokununca native dönem seçim sheet'ini açar.
export default function PeriodFilter() {
  const selection = useDashboardFilterStore((state) => state.selection);
  const label = usePeriodLabel(selection);

  return <PeriodPill label={label} onPress={() => router.push('/period-select')} />;
}
