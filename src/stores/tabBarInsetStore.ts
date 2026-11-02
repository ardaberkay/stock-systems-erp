import { create } from 'zustand';

type TabBarInsetState = {
  bottom: number;
  setBottom: (bottom: number) => void;
};

// iOS'ta sekmenin alt boşluğu ilk karede tab bar'ı içermez. Sekmeler aynı çubuğu paylaştığı için
// ilk öğrenilen değer diğer sekmelerde baştan kullanılır.
export const useTabBarInsetStore = create<TabBarInsetState>()((set) => ({
  bottom: 0,
  setBottom: (bottom) => set({ bottom }),
}));
