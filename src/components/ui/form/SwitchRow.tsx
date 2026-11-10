import Switch from '@/components/ui/Switch';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type SwitchRowProps = {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export default function SwitchRow({ label, hint, value, onValueChange }: SwitchRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    text: {
      flex: 1,
      gap: SPACING.xxs,
    },
    label: {
      ...typography.body,
      color: colors.text,
    },
    hint: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
