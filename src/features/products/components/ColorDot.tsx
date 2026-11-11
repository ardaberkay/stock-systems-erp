import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type ColorDotProps = {
  // Ürün rengi (bkz. getProductColorHex); arayüz teması değil ürün verisidir
  hex: string;
  size?: number;
};

const DEFAULT_SIZE = 8;

// Ürün renginin küçük noktası
export default function ColorDot({ hex, size = DEFAULT_SIZE }: ColorDotProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: hex }]}
    />
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Açık renkler koyu temada ve kart zemininde kaybolmasın diye her noktada kenarlık var
    dot: {
      borderWidth: 1,
      borderColor: colors.textDisabled,
    },
  });
}
