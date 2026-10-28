import { darkColors, lightColors } from './colors';
import { typography } from './typography';

export const themes = {
  light: {
    colors: lightColors,
    typography,
  },
  dark: {
    colors: darkColors,
    typography,
  },
} as const;

export type ThemeMode = keyof typeof themes;

export type AppTheme = (typeof themes)[ThemeMode];

export function getTheme(mode: ThemeMode): AppTheme {
  return themes[mode];
}