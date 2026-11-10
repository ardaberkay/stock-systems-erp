import { useProducts } from '@/features/products/api/products';
import { useProductFilterStore } from '@/features/products/stores/productFilterStore';
import { getVisibleProducts, hasActiveFilters } from '@/features/products/utils/productList';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeferredValue, useMemo, useState } from 'react';

// Ürünler sekmesinin verisi: katalog tek istekle gelir, arama ve filtre telefonda uygulanır.
export function useProductList(searchText: string) {
  const filters = useProductFilterStore((state) => state.filters);
  // Liste düşük öncelikle hesaplanır; yazarken ve modal kapanırken arayüz takılmaz
  const deferredFilters = useDeferredValue(filters);
  const query = useDebounce(searchText);
  const { data, isPending, error, refetch } = useProducts();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const products = useMemo(
    () => getVisibleProducts(data ?? [], query, deferredFilters),
    [data, query, deferredFilters],
  );
  const isFilterActive = hasActiveFilters(filters);

  // Sessiz yenilemede (sekmeye dönüş, uygulamanın öne gelmesi) gösterge dönmesin;
  // yalnızca kullanıcı aşağı çekince görünür
  const refresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return {
    products,
    isFiltering: isFilterActive || query.trim().length > 0,
    hasActiveFilters: isFilterActive,
    isLoading: isPending,
    error,
    isRefreshing,
    refresh,
  };
}
