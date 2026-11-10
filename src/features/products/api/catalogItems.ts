import {
  addProductType,
  catalogKeys,
  deleteProductType,
  getProductTypes,
  updateProductType,
} from '@/features/products/api/catalog';
import { productKeys, useProducts } from '@/features/products/api/products';
import type { CatalogItem, CatalogKind } from '@/features/products/schemas/catalog';
import { countProductsBy, type CatalogProductField } from '@/features/products/utils/catalog';
import { useFocusSubscribed } from '@/hooks/useFocusSubscribed';
import { CACHE } from '@/lib/cachePolicy';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

type CatalogResource = {
  queryKey: readonly unknown[];
  productField: CatalogProductField;
  get: (signal?: AbortSignal) => Promise<CatalogItem[]>;
  add: (name: string) => Promise<number>;
  update: (id: number, name: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

// Tip, marka, renk ve kategori sayfaları aynı listeyi ve formu kullanır; farkları burada
const CATALOG_RESOURCES: Record<CatalogKind, CatalogResource> = {
  types: {
    queryKey: catalogKeys.types(),
    productField: 'typeId',
    get: getProductTypes,
    add: addProductType,
    update: updateProductType,
    remove: deleteProductType,
  },
};

// Ürün formlarındaki seçim alanlarıyla aynı önbelleği paylaşır
export function useCatalogItems(kind: CatalogKind) {
  const { queryKey, get } = CATALOG_RESOURCES[kind];
  const subscribed = useFocusSubscribed(queryKey);

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => get(signal),
    ...CACHE.productOptions,
    subscribed,
  });
}

// Katalog henüz yüklenmediyse undefined döner; satırlarda sayı yerine boşluk kalır
export function useCatalogProductCounts(kind: CatalogKind) {
  const { data: products } = useProducts();
  const { productField } = CATALOG_RESOURCES[kind];

  return useMemo(
    () => (products ? countProductsBy(products, productField) : undefined),
    [products, productField],
  );
}

type SaveCatalogItemVariables = {
  // Yoksa yeni kayıt eklenir
  id?: number;
  name: string;
};

// Liste sunucuyu beklemeden güncellenir, sonra arkada yeniden okunur. Ad değişince ürün kartlarındaki
// eski ad da yenilenmeli; büyük katalog hemen değil, ekran bir sonraki açılışında okunur.
export function useSaveCatalogItem(kind: CatalogKind) {
  const queryClient = useQueryClient();
  const resource = CATALOG_RESOURCES[kind];

  return useMutation({
    mutationFn: async ({ id, name }: SaveCatalogItemVariables) => {
      if (id === undefined) {
        return resource.add(name);
      }
      await resource.update(id, name);

      return id;
    },
    onSuccess: (savedId, { id, name }) => {
      queryClient.setQueryData<CatalogItem[]>(resource.queryKey, (items = []) =>
        id === undefined
          ? [...items, { id: savedId, name }]
          : items.map((item) => (item.id === id ? { ...item, name } : item)),
      );
      void queryClient.invalidateQueries({ queryKey: resource.queryKey });
      if (id !== undefined) {
        void queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: 'none' });
      }
    },
  });
}

export function useDeleteCatalogItem(kind: CatalogKind) {
  const queryClient = useQueryClient();
  const resource = CATALOG_RESOURCES[kind];

  return useMutation({
    mutationFn: (id: number) => resource.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<CatalogItem[]>(resource.queryKey, (items = []) =>
        items.filter((item) => item.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: resource.queryKey });
    },
  });
}
