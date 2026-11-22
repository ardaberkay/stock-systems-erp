import { useAppTheme } from '@/hooks/useAppTheme';
import { haptics } from '@/lib/haptics';
import { StyleSheet, Switch as NativeSwitch } from 'react-native';

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
      // Değer değişikliği seçim tıkı verir. Önce değer yazılır: Ayarlar'daki titreşim anahtarı
      // açılınca tık çalar (açıldığını hissettirir), kapatılınca çalmaz.
      onValueChange={(next) => {
        onValueChange(next);
        haptics.selection();
      }}
      accessibilityLabel={accessibilityLabel}
      style={styles.control}
      trackColor={{ false: colors.border, true: colors.orange }}
      thumbColor={colors.buttonPrimaryText}
      ios_backgroundColor={colors.border}
    />
  );
}

const styles = StyleSheet.create({
  // React Native varsayılan olarak flex-start verir, satır ortalaması geçersiz kalır
  control: {
    alignSelf: 'center',
  },
});
