import { DarkTheme, DefaultTheme } from 'expo-router';
import { darkColors, lightColors, type AppColors } from './colors';

function createNavigationTheme(base: typeof DefaultTheme, colors: AppColors) {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.orange,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.orange,
    },
  };
}

// Verilmezse navigasyon her zaman açık temada kalır: koyu modda ekran zeminleri beyaz görünür,
// native başlık da yanlış modda açılır.
export const navigationThemes = {
  light: createNavigationTheme(DefaultTheme, lightColors),
  dark: createNavigationTheme(DarkTheme, darkColors),
};
