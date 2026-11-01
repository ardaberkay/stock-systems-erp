import { apiClient } from '@/lib/apiClient';
import { cargoCompanyListSchema } from '@/schemas/cargo';
import { useQuery } from '@tanstack/react-query';

// Firma listesi neredeyse hiç değişmez; rate limit için tek istekle saklanır.
const CARGO_CACHE_MS = 60 * 60_000;

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
    staleTime: CARGO_CACHE_MS,
    gcTime: CARGO_CACHE_MS,
    enabled: options?.enabled,
  });
}
