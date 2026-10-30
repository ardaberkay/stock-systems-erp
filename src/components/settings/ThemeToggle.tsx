import Switch from '@/components/ui/Switch';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useThemeStore } from '@/stores/themeStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import Moon from 'lucide-react-native/icons/moon';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <View style={styles.row}>
      <Moon size={ICON_SIZE.md} color={colors.icon} />
      <Text style={styles.label}>{t('theme.darkMode')}</Text>
      <Switch
        value={mode === 'dark'}
        onValueChange={(isDark) => setMode(isDark ? 'dark' : 'light')}
        accessibilityLabel={t('theme.darkMode')}
      />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    label: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
  });
}
