import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SCREEN_CONTENT } from '@/theme/spacing';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

// GEÇİCİ: ürün detayı henüz yok; sipariş detayındaki ürün satırları buraya açılır
export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <StateMessage message={t('common.comingSoon')} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      ...SCREEN_CONTENT,
      flex: 1,
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
  });
}
