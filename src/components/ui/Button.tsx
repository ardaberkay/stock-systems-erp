import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  // destructive: silme gibi geri alınamayan işlemler; ikincil buton görünümünde, kırmızı yazılı
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  // İstek sürerken yazının yerinde gösterge döner, buton basılamaz
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PRESSED_OPACITY = 0.8;

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  const variantStyles = {
    primary: { button: styles.primary, label: styles.primaryLabel, indicator: colors.buttonPrimaryText },
    secondary: { button: styles.secondary, label: styles.secondaryLabel, indicator: colors.text },
    destructive: { button: styles.destructive, label: styles.destructiveLabel, indicator: colors.error },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyles.button,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.indicator} />
      ) : (
        <Text style={[styles.label, variantStyles.label]}>{label}</Text>
      )}
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    button: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      borderWidth: 1,
    },
    primary: {
      backgroundColor: colors.buttonPrimary,
      borderColor: colors.buttonPrimary,
    },
    secondary: {
      backgroundColor: colors.buttonSecondary,
      borderColor: colors.buttonSecondaryBorder,
    },
    destructive: {
      backgroundColor: colors.buttonSecondary,
      borderColor: colors.buttonSecondaryBorder,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: PRESSED_OPACITY,
    },
    label: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
    },
    primaryLabel: {
      color: colors.buttonPrimaryText,
    },
    secondaryLabel: {
      color: colors.buttonSecondaryText,
    },
    destructiveLabel: {
      color: colors.error,
    },
  });
}
