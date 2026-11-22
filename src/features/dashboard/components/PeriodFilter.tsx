import PeriodPill from '@/components/ui/PeriodPill';
import { usePeriodLabel } from '@/features/period/usePeriodLabel';
import { useDashboardFilterStore } from '@/features/dashboard/dashboardFilterStore';
import { router } from 'expo-router';

// Dashboard'un seçili dönemini gösterir; dokununca native dönem seçim sheet'ini açar.
export default function PeriodFilter() {
  const selection = useDashboardFilterStore((state) => state.selection);
  const label = usePeriodLabel(selection);
  const shortLabel = usePeriodLabel(selection, { short: true });

  return (
    <PeriodPill
      label={shortLabel}
      accessibilityHint={label}
      onPress={() => router.push({ pathname: '/period/[scope]', params: { scope: 'dashboard' } })}
    />
  );
}
