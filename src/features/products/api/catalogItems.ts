import {
  addBrand,
  addCategory,
  addColor,
  addProductType,
  catalogKeys,
  deleteBrand,
  deleteCategory,
  deleteColor,
  deleteProductType,
  getBrands,
  getCategories,
  getColors,
  getProductTypes,
  updateBrand,
  updateCategory,
  updateColor,
  updateProductType,
} from '@/features/products/api/catalog';
import { productKeys, useProducts } from '@/features/products/api/products';
import type {
  CatalogItem,
  CatalogKind,
  Category,
  CategoryForm,
  ProductColorItem,
} from '@/features/products/schemas/catalog';
import {
  countProductsBy,
  getCategoryChanges,
  getCategoryFormDefaults,
  toCategoryPayload,
  type ProductCatalogIds,
} from '@/features/products/utils/catalog';
import { useFocusSubscribed } from '@/hooks/useFocusSubscribed';
import { CACHE } from '@/lib/cachePolicy';
import { queryClient } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

type CatalogResource = {
  queryKey: readonly unknown[];
  getProductIds: ProductCatalogIds;
  get: (signal?: AbortSignal) => Promise<CatalogItem[]>;
  add: (name: string) => Promise<number>;
  update: (id: number, name: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

// Tip, marka, renk ve kategori sayfaları aynı listeyi kullanır; farkları burada.
// Kategori formu daha fazla alan içerir ve kendi hook'uyla kaydeder (useSaveCategory).
const CATALOG_RESOURCES: Record<CatalogKind, CatalogResource> = {
  types: {
    queryKey: catalogKeys.types(),
    getProductIds: (product) => [product.typeId],
    get: getProductTypes,
    add: addProductType,
    update: updateProductType,
    remove: deleteProductType,
  },
  colors: {
    queryKey: catalogKeys.colors(),
    getProductIds: (product) => [product.colorId],
    get: getColors,
    // Boş kod, sayfanın zaten yüklediği listeden bulunur; ek istek atılmaz
    add: (name) =>
      addColor(name, queryClient.getQueryData<ProductColorItem[]>(catalogKeys.colors()) ?? []),
    update: updateColor,
    remove: deleteColor,
  },
  brands: {
    queryKey: catalogKeys.brands(),
    // Markasız üründe 0 gelir, sayılmaz
    getProductIds: (product) => [product.brandId],
    get: getBrands,
    add: addBrand,
    update: updateBrand,
    remove: deleteBrand,
  },
  categories: {
    queryKey: catalogKeys.categories(),
    // Bir ürün birden çok kategoride olabilir; her birinde sayılır
    getProductIds: (product) => product.categories.map((category) => category.categoryId),
    get: getCategories,
    add: (name) => addCategory(toCategoryPayload({ ...getCategoryFormDefaults(), name })),
    update: (id, name) => updateCategory(id, { name }),
    remove: deleteCategory,
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

// Katalog henüz yüklenmediyse sayılar undefined döner; satırlarda sayı yerine boşluk kalır.
// refetchProducts: panelde ürünün tipi değişmiş olabilir; aşağı çekince sayılar da yenilensin
export function useCatalogProductCounts(kind: CatalogKind) {
  const { data: products, refetch: refetchProducts } = useProducts();
  const { getProductIds } = CATALOG_RESOURCES[kind];

  const productCounts = useMemo(
    () => (products ? countProductsBy(products, getProductIds) : undefined),
    [products, getProductIds],
  );

  return { productCounts, refetchProducts };
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

type SaveCategoryVariables = {
  // Düzenleme açıldığındaki kategori; yoksa yeni kategori eklenir
  original?: Category;
  values: CategoryForm;
};

// Kategori formunun kaydı: düzenlemede yalnızca değişen alanlar gider. Liste diğer sayfalardaki
// gibi beklemeden güncellenir, sonra arkada yeniden okunur.
export function useSaveCategory() {
  const queryClient = useQueryClient();
  const queryKey = catalogKeys.categories();

  return useMutation({
    mutationFn: async ({ original, values }: SaveCategoryVariables) => {
      if (!original) {
        return addCategory(toCategoryPayload(values));
      }
      await updateCategory(original.id, getCategoryChanges(original, values));

      return original.id;
    },
    onSuccess: (savedId, { original, values }) => {
      const { description, ...payload } = toCategoryPayload(values);
      // Boş açıklama gönderilmediği için eski açıklama sunucuda kalır
      const saved: Category = {
        ...original,
        ...payload,
        id: savedId,
        description: description ?? original?.description,
      };

      queryClient.setQueryData<Category[]>(queryKey, (items = []) =>
        original
          ? items.map((item) => (item.id === original.id ? saved : item))
          : [...items, saved],
      );
      void queryClient.invalidateQueries({ queryKey });
      if (original && original.name.trim() !== payload.name) {
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
