import { useLanguageStore } from '@/stores/languageStore';
import { useThemeStore } from '@/stores/themeStore';
import { useSyncExternalStore } from 'react';

type PersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (listener: () => void) => () => void;
};

// Kalıcı (persist) store'lar buraya eklenir. Hepsi AsyncStorage'dan yüklenene kadar
// splash ekranı açık kalır; böylece yanlış tema/dil bir anlığına görünmez.
const persistedStores: PersistApi[] = [
  useThemeStore.persist,
  useLanguageStore.persist,
];

function allHydrated() {
  return persistedStores.every((store) => store.hasHydrated());
}

function subscribe(onChange: () => void) {
  const unsubscribes = persistedStores.map((store) => store.onFinishHydration(onChange));

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}

export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated);
}
