import { useOrders, useOrderSearch } from '@/api/orders';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useDebounce } from '@/hooks/useDebounce';
import { useOrderFilterStore } from '@/stores/orderFilterStore';
import {
  getVisibleOrders,
  hasActiveOrderFilters,
  mergeOrders,
  parseOrderSearch,
} from '@/utils/orderList';
import { getOrderRange } from '@/utils/orderPeriod';
import { useDeferredValue, useMemo, useState } from 'react';

// Rakam yazılırken her haneye sunucu isteği gitmesin; rate limit paylaşılıyor.
const SERVER_SEARCH_DELAY_MS = 700;

// Siparişler sekmesinin verisi: dönem sunucudan gelir, arama ve filtre yüklü veride çalışır.
// Yalnızca numara veya telefon yüklü veride yoksa sunucuya sorulur.
export function useOrderList(searchText: string) {
  const selection = useOrderFilterStore((state) => state.selection);
  const filters = useOrderFilterStore((state) => state.filters);
  // Liste düşük öncelikle hesaplanır; yazarken ve modal kapanırken arayüz takılmaz
  const deferredFilters = useDeferredValue(filters);
  const query = useDebounce(searchText).trim();
  const serverQuery = useDebounce(searchText, SERVER_SEARCH_DELAY_MS).trim();
  const { now } = useCurrentTime();
  const range = useMemo(() => getOrderRange(selection, now), [selection, now]);
  const ordersQuery = useOrders(range);
  const { data, isPending } = ordersQuery;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadedOrders = useMemo(() => mergeOrders(data ?? []), [data]);
  const localOrders = useMemo(
    () => getVisibleOrders(loadedOrders, query, deferredFilters),
    [loadedOrders, query, deferredFilters],
  );

  const parsedSearch = parseOrderSearch(query);
  const needsServer = parsedSearch !== null && localOrders.length === 0 && !isPending;
  const serverSearch = needsServer && query === serverQuery ? parsedSearch : null;
  const searchQuery = useOrderSearch(serverSearch);
  const serverOrders = useMemo(
    () => (serverSearch ? mergeOrders(searchQuery.data ?? []) : []),
    [serverSearch, searchQuery.data],
  );

  const isServerResult = serverOrders.length > 0;
  const isFilterActive = hasActiveOrderFilters(filters);

  const getEmptyMessageKey = () => {
    if (parsedSearch) {
      return parsedSearch.kind === 'phone' ? 'orders.noPhoneResults' : 'orders.noNumberResults';
    }
    if (query.length > 0) {
      return 'orders.noNameResults';
    }
    return isFilterActive ? 'orders.noFilterResults' : 'orders.emptyPeriod';
  };

  // Sessiz yenilemede gösterge dönmesin; yalnızca kullanıcı aşağı çekince görünür
  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.all([ordersQuery.refetch(), serverSearch ? searchQuery.refetch() : undefined]);
    setIsRefreshing(false);
  };

  return {
    orders: isServerResult ? serverOrders : localOrders,
    // Ad ve kargo isimleri yüklü tüm siparişler için istenir; sunucu sonucu da eklenir.
    lookupOrders: isServerResult ? serverOrders : loadedOrders,
    isFiltering: isFilterActive || query.length > 0,
    hasActiveFilters: isFilterActive,
    isServerResult,
    isSearching: needsServer && (query !== serverQuery || searchQuery.isFetching),
    emptyMessageKey: getEmptyMessageKey(),
    isLoading: isPending,
    error: ordersQuery.error ?? searchQuery.error,
    isRefreshing,
    refresh,
  };
}
