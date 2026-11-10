import { useDashboardFilterStore } from '@/features/dashboard/dashboardFilterStore';
import { ORDER_PERIODS } from '@/features/orders/constants/list';
import { useOrderFilterStore } from '@/features/orders/orderFilterStore';
import { PERIODS, type PeriodScope, type PeriodSelection } from '@/features/period/constants';
import { useReportFilterStore } from '@/features/reports/reportFilterStore';

type PeriodScopeState = {
  periods: readonly string[];
  selection: PeriodSelection<string>;
  selectPreset: (period: string) => void;
  selectRange: (from: Date, to: Date) => void;
};

// Dönem sheet'i hangi ekran için açıldıysa o ekranın listesini ve seçimini verir.
// Üç store da okunur; sheet kısa ömürlü olduğu için maliyeti yok, hook sırası sabit kalır.
export function usePeriodScope(scope: PeriodScope): PeriodScopeState {
  const dashboardSelection = useDashboardFilterStore((state) => state.selection);
  const setDashboardSelection = useDashboardFilterStore((state) => state.setSelection);
  const orderSelection = useOrderFilterStore((state) => state.selection);
  const setOrderSelection = useOrderFilterStore((state) => state.setSelection);
  const reportSelection = useReportFilterStore((state) => state.selection);
  const setReportSelection = useReportFilterStore((state) => state.setSelection);

  switch (scope) {
    case 'dashboard':
      return {
        periods: PERIODS,
        selection: dashboardSelection,
        selectPreset: (value) => {
          const period = PERIODS.find((item) => item === value);
          if (period) setDashboardSelection({ kind: 'preset', period });
        },
        selectRange: (from, to) => setDashboardSelection({ kind: 'range', from, to }),
      };
    case 'orders':
      return {
        periods: ORDER_PERIODS,
        selection: orderSelection,
        selectPreset: (value) => {
          const period = ORDER_PERIODS.find((item) => item === value);
          if (period) setOrderSelection({ kind: 'preset', period });
        },
        selectRange: (from, to) => setOrderSelection({ kind: 'range', from, to }),
      };
    case 'reports':
      return {
        periods: PERIODS,
        selection: reportSelection,
        selectPreset: (value) => {
          const period = PERIODS.find((item) => item === value);
          if (period) setReportSelection({ kind: 'preset', period });
        },
        selectRange: (from, to) => setReportSelection({ kind: 'range', from, to }),
      };
  }
}
