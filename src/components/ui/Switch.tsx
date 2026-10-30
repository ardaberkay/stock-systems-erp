import { useAppTheme } from '@/hooks/useAppTheme';
import { Switch as NativeSwitch } from 'react-native';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

// Native Switch'i tema token'larıyla sarar; renkler her yerde aynı kalsın diye.
export default function Switch({ value, onValueChange, accessibilityLabel }: SwitchProps) {
  const { colors } = useAppTheme();

  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.border, true: colors.orange }}
      thumbColor={colors.buttonPrimaryText}
      ios_backgroundColor={colors.border}
    />
  );
}
