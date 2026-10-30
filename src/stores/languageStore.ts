import type { AppLanguage } from '@/constants/languages';
import i18n, { getDeviceLanguage } from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LanguageState = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: getDeviceLanguage(),
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(language);
      },
    }),
    {
      name: 'language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language }),
      // Kayıtlı dil yüklendiğinde i18n'i de ona geçir.
      onRehydrateStorage: () => (state) => {
        if (state) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
