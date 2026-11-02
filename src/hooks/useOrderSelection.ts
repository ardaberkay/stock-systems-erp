import { useOrderFilterStore } from '@/stores/orderFilterStore';
import { useCallback, useState } from 'react';

const NO_SELECTION: ReadonlySet<number> = new Set();

// Seçim kümesi boş değilse seçim modu açıktır; son kart kaldırılınca mod kendiliğinden kapanır.
export function useOrderSelection(searchText: string) {
  const period = useOrderFilterStore((state) => state.selection);
  const filters = useOrderFilterStore((state) => state.filters);
  const [selectedIds, setSelectedIds] = useState(NO_SELECTION);
  const [scope, setScope] = useState({ period, filters, searchText });

  // Liste değişince ekranda görünmeyen bir sipariş seçili kalmasın
  if (scope.period !== period || scope.filters !== filters || scope.searchText !== searchText) {
    setScope({ period, filters, searchText });
    setSelectedIds(NO_SELECTION);
  }

  const toggle = useCallback((orderId: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (!next.delete(orderId)) {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((orderIds: number[]) => {
    setSelectedIds(new Set(orderIds));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(NO_SELECTION);
  }, []);

  return { selectedIds, isSelecting: selectedIds.size > 0, toggle, selectAll, clear };
}
