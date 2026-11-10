import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type DetailNoteProps = {
  label: string;
  // Boşsa "—" görünür
  value: string | null | undefined;
};

const EMPTY_VALUE = '—';

// Uzun serbest metinler (açıklama, ek bilgiler) için: etiket üstte, metin altta, sola dayalı
export default function DetailNote({ label, value }: DetailNoteProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.note}>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <Text style={styles.value} selectable>
          {value}
        </Text>
      ) : (
        <Text style={[styles.value, styles.empty]}>{EMPTY_VALUE}</Text>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    note: {
      gap: SPACING.xxs,
    },
    label: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    value: {
      ...typography.label,
      color: colors.text,
    },
    empty: {
      color: colors.textDisabled,
    },
  });
}
