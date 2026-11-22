import Switch from '@/components/ui/Switch';
import Text from '@/components/ui/Text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHapticsStore } from '@/stores/hapticsStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import AudioWaveform from 'lucide-react-native/icons/audio-waveform';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

// Ayarlardaki titreşim anahtarı; koyu mod satırıyla aynı görünüm
export default function HapticsToggle() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const enabled = useHapticsStore((state) => state.enabled);
  const setEnabled = useHapticsStore((state) => state.setEnabled);

  return (
    <View style={styles.row}>
      <AudioWaveform size={ICON_SIZE.md} color={colors.icon} />
      <Text style={styles.label}>{t('settings.haptics')}</Text>
      <Switch value={enabled} onValueChange={setEnabled} accessibilityLabel={t('settings.haptics')} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    label: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
  });
}
