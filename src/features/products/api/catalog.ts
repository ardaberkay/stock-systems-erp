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
  type ProductColorItem,
} from '@/features/products/schemas/catalog';
import { getFreeColorCode, type CategoryPayload } from '@/features/products/utils/catalog';
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

// Tip ve marka kodu zorunlu ve benzersiz ama listede gelmiyor; boş kod aranamadığı için rastgele
// 4 haneli kod verilir. Çakışırsa sunucu genel bir "logic" hatası döner, bir kez başka kodla denenir.
const RANDOM_CODE_MIN = 1000;
const RANDOM_CODE_RANGE = 9000;

function createRandomCode() {
  return String(RANDOM_CODE_MIN + Math.floor(Math.random() * RANDOM_CODE_RANGE));
}

function postNamedItem(path: string, name: string, code: string) {
  return apiClient.post(path, {
    schema: catalogCreatedSchema,
    arguments: { name, code },
  });
}

// Yeni kaydın id'sini döner
async function addWithRandomCode(path: string, name: string) {
  try {
    return await postNamedItem(path, name, createRandomCode());
  } catch (error) {
    if (isApiError(error) && error.kind === 'unknown') {
      return postNamedItem(path, name, createRandomCode());
    }
    throw error;
  }
}

export function addProductType(name: string) {
  return addWithRandomCode('product/addType', name);
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

export function addBrand(name: string) {
  return addWithRandomCode('product/addBrand', name);
}

export async function updateBrand(id: number, name: string) {
  await apiClient.post('product/updateBrand', {
    schema: catalogAffectedSchema,
    arguments: { selectArguments: { id }, updateArguments: { name } },
  });
}

export async function deleteBrand(id: number) {
  await apiClient.post('product/deleteBrand', {
    schema: catalogAffectedSchema,
    arguments: { id },
  });
}

function postColor(name: string, code: string) {
  return postNamedItem('product/addColor', name, code);
}

// Yeni rengin id'sini döner. Kod eldeki listeden seçilir; liste eskiyse ve o kod bu arada
// alınmışsa sunucu "logic" hatası döner, güncel liste okunup bir kez daha denenir.
export async function addColor(name: string, knownColors: ProductColorItem[]) {
  try {
    return await postColor(name, getFreeColorCode(knownColors.map((color) => color.code)));
  } catch (error) {
    if (isApiError(error) && error.kind === 'unknown') {
      const colors = await getColors();
      return postColor(name, getFreeColorCode(colors.map((color) => color.code)));
    }
    throw error;
  }
}

export async function updateColor(id: number, name: string) {
  await apiClient.post('product/updateColor', {
    schema: catalogAffectedSchema,
    arguments: { selectArguments: { id }, updateArguments: { name } },
  });
}

export async function deleteColor(id: number) {
  await apiClient.post('product/deleteColor', {
    schema: catalogAffectedSchema,
    arguments: { id },
  });
}

export async function getCategories(signal?: AbortSignal) {
  const { data } = await apiClient.post('product/getCategory', {
    schema: categoryListSchema,
    signal,
  });

  return data;
}

// Kategoride kod yok; adı aynı üst kategori altında benzersiz olmalı. Yeni kategorinin id'sini döner
export function addCategory(payload: CategoryPayload) {
  return apiClient.post('product/addCategory', {
    schema: catalogCreatedSchema,
    arguments: payload,
  });
}

// Yalnızca değişen alanlar gönderilir
export async function updateCategory(id: number, changes: Partial<CategoryPayload>) {
  await apiClient.post('product/updateCategory', {
    schema: catalogAffectedSchema,
    arguments: { selectArguments: { id }, updateArguments: changes },
  });
}

// Sunucu alt kategorisi olan kategoriyi de siler ve alt kategori güncellenemez hale gelir;
// bu yüzden uygulama alt kategorisi olan kategoride silmeyi engeller.
export async function deleteCategory(id: number) {
  await apiClient.post('product/deleteCategory', {
    schema: catalogAffectedSchema,
    arguments: { id },
  });
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

// enabled: katalog sayfası tüm türlerde aynı bileşen; kategori alanları yalnızca orada okunur
export function useCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: ({ signal }) => getCategories(signal),
    ...CACHE.productOptions,
    enabled: options?.enabled,
  });
}
