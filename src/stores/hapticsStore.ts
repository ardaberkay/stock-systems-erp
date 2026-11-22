import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type HapticsState = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

// Ayarlardaki "Titreşim" anahtarı; varsayılan açık. Telefonun kendi titreşim ayarı ayrıca geçerli.
export const useHapticsStore = create<HapticsState>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: 'haptics',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ enabled: state.enabled }),
    },
  ),
);
