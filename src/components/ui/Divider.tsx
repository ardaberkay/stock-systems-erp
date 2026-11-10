import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type DividerProps = {
  // Yatay kenar boşluğu; satır metniyle hizalı başlasın diye
  inset?: number;
};

// Liste satırları arasındaki ince çizgi. Ekranın en ince çizgisi kullanılır, satırları ağırlaştırmaz.
export default function Divider({ inset = 0 }: DividerProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return <View style={[styles.divider, { marginHorizontal: inset }]} />;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
    },
  });
}
