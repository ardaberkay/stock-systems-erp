import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import Check from 'lucide-react-native/icons/check';
import { StyleSheet, View } from 'react-native';

type CheckboxProps = {
  checked: boolean;
  colors: AppColors;
};

const CHECK_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;

// Yalnızca görünümdür; dokunma alanı onu içeren satır veya karttır.
export default function Checkbox({ checked, colors }: CheckboxProps) {
  return (
    <View
      style={[
        styles.box,
        checked
          ? { borderColor: colors.orange, backgroundColor: colors.orange }
          : { borderColor: colors.border },
      ]}
    >
      {checked ? <Check size={CHECK_ICON_SIZE} color={colors.buttonPrimaryText} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: ICON_SIZE.md,
    height: ICON_SIZE.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
});
