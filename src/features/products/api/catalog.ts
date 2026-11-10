import { apiClient } from '@/lib/apiClient';
import { isApiError } from '@/lib/apiError';
import { CACHE } from '@/lib/cachePolicy';
import {
  brandListSchema,
  catalogAffectedSchema,
  catalogCreatedSchema,
  categoryListSchema,
  colorListSchema,
  productTypeListSchema,
} from '@/features/products/schemas/catalog';
import { useQuery } from '@tanstack/react-query';

export const catalogKeys = {
  all: ['catalog'] as const,
  brands: () => [...catalogKeys.all, 'brands'] as const,
  types: () => [...catalogKeys.all, 'types'] as const,
  colors: () => [...catalogKeys.all, 'colors'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
};

export async function getBrands(signal?: AbortSignal) {
  const { data } = await apiClient.post('product/getBrands', { schema: brandListSchema, signal });

  return data;
}

export async function getProductTypes(signal?: AbortSignal) {
  const { data } = await apiClient.post('product/getTypes', {
    schema: productTypeListSchema,
    signal,
  });

  return data;
}

// Tip kodu zorunlu ve benzersiz ama listede gelmiyor; boş kod aranamadığı için rastgele 4 haneli
// kod verilir. Çakışırsa sunucu genel bir "logic" hatası döner, bir kez başka kodla denenir.
const TYPE_CODE_MIN = 1000;
const TYPE_CODE_RANGE = 9000;

function createTypeCode() {
  return String(TYPE_CODE_MIN + Math.floor(Math.random() * TYPE_CODE_RANGE));
}

function postProductType(name: string, code: string) {
  return apiClient.post('product/addType', {
    schema: catalogCreatedSchema,
    arguments: { name, code },
  });
}

// Yeni tipin id'sini döner
export async function addProductType(name: string) {
  try {
    return await postProductType(name, createTypeCode());
  } catch (error) {
    if (isApiError(error) && error.kind === 'unknown') {
      return postProductType(name, createTypeCode());
    }
    throw error;
  }
}

export async function updateProductType(id: number, name: string) {
  await apiClient.post('product/updateType', {
    schema: catalogAffectedSchema,
    arguments: { selectArguments: { id }, updateArguments: { name } },
  });
}

// Ürünü olan tip silinemeyebilir; sunucu reddederse genel "logic" hatası döner
export async function deleteProductType(id: number) {
  await apiClient.post('product/deleteType', {
    schema: catalogAffectedSchema,
    arguments: { id },
  });
}

export async function getColors(signal?: AbortSignal) {
  const { data } = await apiClient.post('product/getColors', { schema: colorListSchema, signal });

  return data;
}

export async function getCategories(signal?: AbortSignal) {
  const { data } = await apiClient.post('product/getCategory', {
    schema: categoryListSchema,
    signal,
  });

  return data;
}

export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: ({ signal }) => getBrands(signal),
    ...CACHE.productOptions,
  });
}

export function useProductTypes() {
  return useQuery({
    queryKey: catalogKeys.types(),
    queryFn: ({ signal }) => getProductTypes(signal),
    ...CACHE.productOptions,
  });
}

export function useColors() {
  return useQuery({
    queryKey: catalogKeys.colors(),
    queryFn: ({ signal }) => getColors(signal),
    ...CACHE.productOptions,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: ({ signal }) => getCategories(signal),
    ...CACHE.productOptions,
  });
}
