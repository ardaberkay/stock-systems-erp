import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type DetailRowProps = {
  label: string;
  // Boşsa "—" görünür; alanın yeri hep durur, kullanıcı bilginin olmadığını görür
  value: string | null | undefined;
  // Takip kodu gibi değerler basılı tutularak kopyalanabilir
  selectable?: boolean;
  emphasized?: boolean;
  // Değerin sağındaki butonlar (WhatsApp, arama…)
  actions?: ReactNode;
};

const EMPTY_VALUE = '—';

export default function DetailRow({
  label,
  value,
  selectable,
  emphasized,
  actions,
}: DetailRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasValue = Boolean(value);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueArea}>
        <Text
          style={[
            styles.value,
            emphasized && styles.emphasized,
            !hasValue && styles.empty,
          ]}
          selectable={selectable && hasValue}
        >
          {hasValue ? value : EMPTY_VALUE}
        </Text>
        {actions}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    label: {
      ...typography.bodySmall,
      flexShrink: 0,
      color: colors.textSecondary,
    },
    valueArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      // Değer ile butonlar arası, butonların kendi arasındaki boşlukla aynı (ContactActions)
      gap: SPACING.xxxl,
      minWidth: 0,
    },
    value: {
      ...typography.label,
      flexShrink: 1,
      textAlign: 'right',
      color: colors.text,
    },
    emphasized: {
      fontFamily: FONT_FAMILY.bold,
    },
    empty: {
      color: colors.textDisabled,
    },
  });
}
