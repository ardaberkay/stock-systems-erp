import { apiClient } from '@/lib/apiClient';
import { cityListSchema, districtListSchema } from '@/schemas/address';
import { useQuery } from '@tanstack/react-query';

// İl ve ilçe listesi neredeyse hiç değişmez; uygulama açık kaldıkça tekrar istenmez.
const ADDRESS_CACHE_MS = 24 * 60 * 60_000;

export const addressKeys = {
  all: ['address'] as const,
  cities: () => [...addressKeys.all, 'cities'] as const,
  districts: (cityId: number) => [...addressKeys.all, 'districts', cityId] as const,
};

export async function getCities(signal?: AbortSignal) {
  const { data } = await apiClient.post('address/getCity', {
    schema: cityListSchema,
    signal,
  });

  return data;
}

// Argüman adı `cityIds`; `cityId` yazılırsa yok sayılır ve 979 ilçenin hepsi gelir.
export async function getDistricts(cityId: number, signal?: AbortSignal) {
  const { data } = await apiClient.post('address/getDistrict', {
    schema: districtListSchema,
    arguments: { cityIds: cityId },
    signal,
  });

  return data;
}

export function useCities(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: addressKeys.cities(),
    queryFn: ({ signal }) => getCities(signal),
    staleTime: ADDRESS_CACHE_MS,
    gcTime: ADDRESS_CACHE_MS,
    enabled: options?.enabled,
  });
}

export function useDistricts(cityId: number | null) {
  return useQuery({
    queryKey: addressKeys.districts(cityId ?? 0),
    queryFn: ({ signal }) => getDistricts(cityId ?? 0, signal),
    staleTime: ADDRESS_CACHE_MS,
    gcTime: ADDRESS_CACHE_MS,
    enabled: cityId !== null,
  });
}
