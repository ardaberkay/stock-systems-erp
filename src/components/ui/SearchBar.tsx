import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import Search from 'lucide-react-native/icons/search';
import X from 'lucide-react-native/icons/x';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Search size={ICON_SIZE.md} color={colors.icon} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
      />

      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.clear')}
          onPress={() => onChangeText('')}
          hitSlop={SPACING.md}
        >
          <X size={ICON_SIZE.sm} color={colors.icon} />
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    input: {
      ...typography.bodySmall,
      flex: 1,
      paddingVertical: 0,
      color: colors.text,
    },
  });
}
