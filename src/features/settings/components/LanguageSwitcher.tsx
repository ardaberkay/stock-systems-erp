import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import { usePickerSheet } from '@/features/picker/usePickerSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLanguageStore } from '@/stores/languageStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import Languages from 'lucide-react-native/icons/languages';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet } from 'react-native';

// Seçili dil; dokununca diller seçim sheet'inde açılır (formlardaki seçim alanlarıyla aynı).
// Satır içinde açılan liste sayfayı aşağı itiyordu ve dil sayısı artınca uzayacaktı.
export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { openPicker } = usePickerSheet();

  const openLanguages = () =>
    openPicker({
      title: t('settings.language'),
      items: SUPPORTED_LANGUAGES.map((value) => ({ value, label: t(`language.${value}`) })),
      value: language,
      onSelect: (value) => {
        const next = SUPPORTED_LANGUAGES.find((item) => item === value);

        if (next) {
          setLanguage(next);
        }
      },
    });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('settings.language')}
      accessibilityHint={t(`language.${language}`)}
      onPress={openLanguages}
      style={styles.row}
    >
      <Languages size={ICON_SIZE.md} color={colors.icon} />
      <Text style={styles.label}>{t(`language.${language}`)}</Text>
      <ChevronDown size={ICON_SIZE.md} color={colors.icon} />
    </Pressable>
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
