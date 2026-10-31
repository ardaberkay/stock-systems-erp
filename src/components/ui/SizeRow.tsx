import { SIZES_PER_ROW } from '@/constants/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

export type SizeCell = {
  key: string;
  text: string;
  isOutOfStock: boolean;
};

type SizeRowProps = {
  cells: SizeCell[];
  // Beden adı koyu, adet soluk yazılır
  variant: 'size' | 'quantity';
};

// Sabit genişlikli hücreler sayesinde adetler bedenlerin tam altına oturur.
const CELL_WIDTH: DimensionValue = `${100 / SIZES_PER_ROW}%`;
// Yazı küçültme ölçüm gerektirir; yalnızca sığmayacak kadar uzun metinlerde açılır.
const LONG_TEXT_LENGTH = 5;

export default function SizeRow({ cells, variant }: SizeRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {cells.map((cell) => (
        <Text
          key={cell.key}
          style={[
            styles.cell,
            variant === 'quantity' && styles.quantity,
            cell.isOutOfStock && styles.outOfStock,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={cell.text.length > LONG_TEXT_LENGTH}
        >
          {cell.text}
        </Text>
      ))}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
    },
    cell: {
      ...typography.caption,
      width: CELL_WIDTH,
      color: colors.text,
      fontFamily: FONT_FAMILY.semiBold,
      textAlign: 'center',
    },
    quantity: {
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.regular,
    },
    outOfStock: {
      color: colors.textDisabled,
      textDecorationLine: 'line-through',
    },
  });
}
