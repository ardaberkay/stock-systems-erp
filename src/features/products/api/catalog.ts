import { apiClient } from '@/lib/apiClient';
import { CACHE } from '@/lib/cachePolicy';
import {
  brandListSchema,
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
