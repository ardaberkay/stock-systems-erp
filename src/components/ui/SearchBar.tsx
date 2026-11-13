import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { LucideIcon } from 'lucide-react-native';
import Search from 'lucide-react-native/icons/search';
import X from 'lucide-react-native/icons/x';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '@/components/ui/TextInput';
import { Pressable, StyleSheet, View } from 'react-native';

export type SearchBarAction = {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
};

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  // Sağ uçta ek buton (ör. barkod okutma)
  action?: SearchBarAction;
};

// Sağdaki butonun dokunma alanı 44'e tamamlanır; kutunun yüksekliği değişmez
const ACTION_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.md) / 2;

export default function SearchBar({ value, onChangeText, placeholder, action }: SearchBarProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasValue = value.length > 0;

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

      {hasValue && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.clear')}
          onPress={() => onChangeText('')}
          hitSlop={SPACING.md}
        >
          <X size={ICON_SIZE.sm} color={colors.icon} />
        </Pressable>
      )}

      {/* Temizle metni siler, ek buton yeni bir iş başlatır; çizgi ikisini ayırır */}
      {hasValue && action && <View style={styles.divider} />}

      {action && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          onPress={action.onPress}
          hitSlop={ACTION_HIT_SLOP}
        >
          <action.icon size={ICON_SIZE.md} color={colors.text} />
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
    // TextInput'a lineHeight verilmez: yazarken metin aşağı kayar ve g, y gibi harflerin
    // alt kısmı kesilir. Preset'ten yalnızca font ailesi ve boyutu alınır.
    input: {
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      flex: 1,
      paddingVertical: 0,
      color: colors.text,
    },
    divider: {
      width: 1,
      height: ICON_SIZE.md,
      backgroundColor: colors.border,
    },
  });
}
