import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import ColorDot from '@/features/products/components/ColorDot';
import { getProductColorHex } from '@/features/products/utils/productColor';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type ProductColorProps = {
  colorName: string | null | undefined;
};

// Renk adı ve varsa noktası; API renk kodu vermediği için nokta addan bulunur.
export default function ProductColor({ colorName }: ProductColorProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const colorHex = getProductColorHex(colorName);

  if (!colorName) {
    return null;
  }

  return (
    <View style={styles.container}>
      {colorHex && <ColorDot hex={colorHex} />}
      <Text style={styles.name} numberOfLines={1}>
        {colorName}
      </Text>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      minWidth: 0,
      flexShrink: 1,
    },
    name: {
      ...typography.caption,
      color: colors.textSecondary,
      flexShrink: 1,
    },
  });
}
