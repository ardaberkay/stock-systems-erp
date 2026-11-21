import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type CargoStepBarProps = {
  current: number;
  total: number;
  colors: AppColors;
};

const BAR_WIDTH = SPACING.md;
const BAR_HEIGHT = SPACING.xs;

// Siparişin kargo sürecinde kaçıncı adımda olduğunu dolu çubuklarla gösterir
export default function CargoStepBar({ current, total, colors }: CargoStepBarProps) {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={t('orders.cargoStep', { current, total })}
      style={styles.row}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            { backgroundColor: index < current ? colors.green : colors.divider },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: RADIUS.full,
  },
});
