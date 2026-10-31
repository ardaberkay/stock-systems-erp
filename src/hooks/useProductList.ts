import { useProducts } from '@/api/products';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductFilterStore } from '@/stores/productFilterStore';
import { getVisibleProducts, hasActiveFilters } from '@/utils/productList';
import { useDeferredValue, useMemo } from 'react';

// Ürünler sekmesinin verisi: katalog tek istekle gelir, arama ve filtre telefonda uygulanır.
export function useProductList(searchText: string) {
  const filters = useProductFilterStore((state) => state.filters);
  // Liste düşük öncelikle hesaplanır; yazarken ve modal kapanırken arayüz takılmaz
  const deferredFilters = useDeferredValue(filters);
  const query = useDebounce(searchText);
  const { data, isPending, error, isRefetching, refetch } = useProducts();

  const products = useMemo(
    () => getVisibleProducts(data ?? [], query, deferredFilters),
    [data, query, deferredFilters],
  );
  const isFilterActive = hasActiveFilters(filters);

  const refresh = async () => {
    await refetch();
  };

  return {
    products,
    isFiltering: isFilterActive || query.trim().length > 0,
    hasActiveFilters: isFilterActive,
    isLoading: isPending,
    error,
    isRefreshing: isRefetching,
    refresh,
  };
}
