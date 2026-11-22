import type { ProductColorSwatch } from '@/features/products/utils/productColor';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type ColorDotProps = {
  // Ürün rengi (bkz. getProductColorSwatch); arayüz teması değil ürün verisidir.
  // null: ad tanınmadı (Leopar, mağazanın özel adı), boş halka çizilir
  swatch: ProductColorSwatch | null;
  size?: number;
};

const DEFAULT_SIZE = 8;

// Ürün renginin küçük noktası. İki renkli adda nokta ortadan ikiye bölünür; tanınmayan adda
// boş halka yer tutar, satırlar hizalı kalır.
export default function ColorDot({ swatch, size = DEFAULT_SIZE }: ColorDotProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (!swatch) {
    return <View style={[styles.dot, shape]} />;
  }

  return (
    <View style={[styles.dot, styles.filled, shape]}>
      <View style={[styles.half, { backgroundColor: swatch.primary }]} />
      <View style={[styles.half, { backgroundColor: swatch.secondary ?? swatch.primary }]} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Açık renkler koyu temada ve kart zemininde kaybolmasın diye her noktada kenarlık var
    dot: {
      borderWidth: 1,
      borderColor: colors.textDisabled,
    },
    filled: {
      flexDirection: 'row',
      overflow: 'hidden',
    },
    half: {
      flex: 1,
    },
  });
}
