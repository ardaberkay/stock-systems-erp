import { useThemeStore } from '@/stores/themeStore';
import type { AppColors } from '@/theme/colors';
import { getTheme, type ThemeMode } from '@/theme/theme';

type AppThemeValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppColors;
};

// Bileşenler renkleri her zaman bu hook'tan alır; lightColors/darkColors doğrudan import edilmez.
export function useAppTheme(): AppThemeValue {
  const mode = useThemeStore((state) => state.mode);

  return {
    mode,
    isDark: mode === 'dark',
    colors: getTheme(mode).colors,
  };
}
