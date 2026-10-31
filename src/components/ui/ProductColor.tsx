import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { getProductColorHex } from '@/utils/productColor';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      {colorHex && <View style={[styles.dot, { backgroundColor: colorHex }]} />}
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
    // Açık renkler koyu temada ve kart zemininde kaybolmasın diye her noktada kenarlık var
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.textDisabled,
    },
    name: {
      ...typography.caption,
      color: colors.textSecondary,
      flexShrink: 1,
    },
  });
}
