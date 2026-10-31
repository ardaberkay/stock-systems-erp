import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 250;

// Değer durulana kadar eski halini döndürür; her harfte liste yeniden hesaplanmaz.
export function useDebounce<T>(value: T, delay = DEFAULT_DELAY_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}
