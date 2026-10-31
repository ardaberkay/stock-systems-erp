import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

// Uygulama açık kalsa bile "bugün" eskimesin diye öne gelince yenilenir.
export function useCurrentTime() {
  const [now, setNow] = useState(() => new Date());
  const refreshNow = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        refreshNow();
      }
    });

    return () => subscription.remove();
  }, [refreshNow]);

  return { now, refreshNow };
}
