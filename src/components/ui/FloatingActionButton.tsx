import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import type { LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

type FloatingActionButtonProps = {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  // Alt sekme çubuğu ekranın üstüne biniyorsa buton onun üzerinde durur
  bottomOffset?: number;
};

const BUTTON_SIZE = 56;

export default function FloatingActionButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  bottomOffset = 0,
}: FloatingActionButtonProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.button, { bottom: bottomOffset + SPACING.xl }]}
    >
      <Icon size={ICON_SIZE.lg} color={colors.buttonPrimaryText} />
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    button: {
      position: 'absolute',
      right: SPACING.xl,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.full,
      backgroundColor: colors.buttonPrimary,
    },
  });
}
