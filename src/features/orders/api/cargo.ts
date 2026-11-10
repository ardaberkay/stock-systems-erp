import { cargoCompanyListSchema } from '@/features/orders/schemas/cargo';
import { apiClient } from '@/lib/apiClient';
import { CACHE } from '@/lib/cachePolicy';
import { useQuery } from '@tanstack/react-query';

export const cargoKeys = {
  all: ['cargo'] as const,
  companies: () => [...cargoKeys.all, 'companies'] as const,
};

export async function getCargoCompanies(signal?: AbortSignal) {
  const { data } = await apiClient.post('cargo/getCompanies', {
    schema: cargoCompanyListSchema,
    signal,
  });

  return data;
}

export function useCargoCompanies(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cargoKeys.companies(),
    queryFn: ({ signal }) => getCargoCompanies(signal),
    ...CACHE.lookups,
    enabled: options?.enabled,
  });
}
