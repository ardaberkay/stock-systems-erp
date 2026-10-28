import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Pressable, StyleSheet, Text } from 'react-native';

type ThemeToggleProps = {
  colors: AppColors;
  isDarkMode: boolean;
  onToggle: () => void;
};

export default function ThemeToggle({
  colors,
  isDarkMode,
  onToggle,
}: ThemeToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Koyu temayı aç veya kapat"
      accessibilityState={{ checked: isDarkMode }}
      onPress={onToggle}
      style={[
        styles.button,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
        ]}
      >
        {isDarkMode ? '☀ Açık' : '☾ Koyu'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});