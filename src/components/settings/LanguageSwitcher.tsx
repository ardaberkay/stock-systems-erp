import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLanguageStore } from '@/stores/languageStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import Languages from 'lucide-react-native/icons/languages';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [open, setOpen] = useState(false);

  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('settings.language')}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((previous) => !previous)}
        style={styles.row}
      >
        <Languages size={ICON_SIZE.md} color={colors.icon} />
        <Text style={styles.label}>{t(`language.${language}`)}</Text>
        <Chevron size={ICON_SIZE.md} color={colors.icon} />
      </Pressable>

      {open && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          accessibilityRole="radiogroup"
          style={styles.options}
        >
          {SUPPORTED_LANGUAGES.map((value) => {
            const active = value === language;

            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={t(`language.${value}`)}
                onPress={() => {
                  setLanguage(value);
                  setOpen(false);
                }}
                style={styles.option}
              >
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {t(`language.${value}`)}
                </Text>
                {active && <Check size={ICON_SIZE.md} color={colors.orange} />}
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
    },
    label: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
    options: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    option: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      // İkon sütunuyla hizalı dursun diye ikon genişliği kadar içeriden başlar
      paddingLeft: SPACING.md + ICON_SIZE.md + SPACING.md,
    },
    optionLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    optionLabelActive: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
  });
}
