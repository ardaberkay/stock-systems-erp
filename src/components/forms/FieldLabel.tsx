import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

type FieldLabelProps = {
  label: string;
  // Zorunlu alanlarda etiketin yanında yıldız görünür; formun üstündeki not açıklar
  required?: boolean;
};

// Form alanlarının ortak etiketi. Yıldız ekran okuyucuya okunmaz; alan kendi
// erişilebilirlik etiketinde "zorunlu" der.
export default function FieldLabel({ label, required = false }: FieldLabelProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Text style={styles.label} importantForAccessibility="no" accessibilityElementsHidden>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    label: {
      ...typography.label,
      color: colors.textSecondary,
    },
    required: {
      color: colors.error,
    },
  });
}
