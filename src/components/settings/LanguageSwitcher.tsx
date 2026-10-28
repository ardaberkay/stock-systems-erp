import type { AppColors } from '@/theme/colors';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type LanguageSwitcherProps = {
  colors: AppColors;
};

export default function LanguageSwitcher({
  colors,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const currentLanguage = (
    i18n.resolvedLanguage ?? i18n.language
  ).startsWith('en')
    ? 'en'
    : 'tr';

  const languages = ['tr', 'en'] as const;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 3,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    button: {
      minWidth: 40,
      minHeight: 32,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
    },
    buttonActive: {
      backgroundColor: colors.orange,
    },
    text: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    textActive: {
      color: colors.chipActiveText,
    },
  });

  return (
    <View style={styles.container}>
      {languages.map((language) => {
        const active = currentLanguage === language;

        return (
          <Pressable
            key={language}
            onPress={() => {
              if (!active) {
                void i18n.changeLanguage(language);
              }
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.button,
              active && styles.buttonActive,
            ]}
          >
            <Text
              style={[
                styles.text,
                active && styles.textActive,
              ]}
            >
              {language.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}