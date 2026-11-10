import { AppState } from 'react-native';
import { create } from 'zustand';

type ClockState = {
  now: Date;
  refreshNow: () => void;
};

// Dönem hesapları (bugün, son 7 gün) tek bir "şimdi"ye bakar. Her hook kendi saatini tutunca
// yenilemede biri ileri, diğeri geride kalıyor; gece yarısından sonra fazladan istek gidiyordu.
export const useClockStore = create<ClockState>()((set) => ({
  now: new Date(),
  refreshNow: () => set({ now: new Date() }),
}));

// Uygulama açık kalsa bile "bugün" eskimesin diye öne gelince yenilenir.
// Uygulama boyunca tek dinleyici yeterli olduğu için kaldırılmaz.
AppState.addEventListener('change', (status) => {
  if (status === 'active') {
    useClockStore.getState().refreshNow();
  }
});
