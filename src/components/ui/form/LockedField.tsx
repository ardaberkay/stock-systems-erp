import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import Lock from 'lucide-react-native/icons/lock';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type LockedFieldProps = {
  label: string;
  value: string | null | undefined;
};

const EMPTY_VALUE = '—';

// Düzenleme formunda API'nin henüz değiştiremediği alan: giriş kutusu gibi görünür ama kilitlidir
export default function LockedField({ label, value }: LockedFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.box}
        accessible
        accessibilityLabel={label}
        accessibilityValue={{ text: value || EMPTY_VALUE }}
        accessibilityHint={t('orders.editMode.locked')}
        accessibilityState={{ disabled: true }}
      >
        <Text style={styles.value} numberOfLines={1}>
          {value || EMPTY_VALUE}
        </Text>
        <Lock size={ICON_SIZE.sm} color={colors.iconDisabled} />
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    field: {
      gap: SPACING.xs,
    },
    label: {
      ...typography.label,
      color: colors.textSecondary,
    },
    box: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    value: {
      ...typography.body,
      flex: 1,
      color: colors.textDisabled,
    },
  });
}
