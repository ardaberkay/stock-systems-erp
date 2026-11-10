import { cityListSchema, districtListSchema } from '@/features/orders/schemas/address';
import { apiClient } from '@/lib/apiClient';
import { CACHE } from '@/lib/cachePolicy';
import { useQuery } from '@tanstack/react-query';

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
    ...CACHE.lookups,
    enabled: options?.enabled,
  });
}

export function useDistricts(cityId: number | null) {
  return useQuery({
    queryKey: addressKeys.districts(cityId ?? 0),
    queryFn: ({ signal }) => getDistricts(cityId ?? 0, signal),
    ...CACHE.lookups,
    enabled: cityId !== null,
  });
}
