import { isApiError, type ApiErrorKind } from '@/lib/apiError';
import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

// Yalnızca geçici olabilecek hatalarda tekrar denenir; 401/404/doğrulama hataları denenmez.
const RETRYABLE_ERRORS: ApiErrorKind[] = ['network', 'timeout', 'rateLimit', 'server'];
const MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 8_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES &&
        isApiError(error) &&
        RETRYABLE_ERRORS.includes(error.kind),
      // Rate limit'te hemen tekrar denemek yine reddedilir, bekleme süresi katlanır.
      retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, MAX_RETRY_DELAY_MS),
    },
    mutations: {
      retry: false,
    },
  },
});

// Uygulama arka plandan öne geldiğinde bayat veriler yenilenir.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status) => {
    handleFocus(status === 'active');
  });

  return () => subscription.remove();
});
