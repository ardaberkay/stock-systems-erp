import LanguageSwitcher from '@/features/settings/components/LanguageSwitcher';
import ThemeToggle from '@/features/settings/components/ThemeToggle';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.appearance')}</Text>
        <ThemeToggle />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      ...SCREEN_CONTENT,
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      gap: SPACING.xxl,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xl,
    },
    section: {
      gap: SPACING.sm,
    },
    sectionLabel: {
      ...typography.label,
      color: colors.textSecondary,
    },
  });
}
