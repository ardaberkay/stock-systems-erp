import { useClockStore } from '@/stores/clockStore';

// Tüm ekranlar ve hook'lar aynı "şimdi"yi okur (bkz. clockStore).
export function useCurrentTime() {
  const now = useClockStore((state) => state.now);
  const refreshNow = useClockStore((state) => state.refreshNow);

  return { now, refreshNow };
}
