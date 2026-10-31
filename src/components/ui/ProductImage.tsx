import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS } from '@/theme/spacing';
import { Image } from 'expo-image';
import ImageIcon from 'lucide-react-native/icons/image';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type ProductImageProps = {
  uri: string | null | undefined;
  accessibilityLabel: string;
};

const IMAGE_SIZE = 100;
const FADE_DURATION_MS = 200;

// Görsel yoksa, yüklenirken veya adres bozuksa nötr varsayılan alan görünür.
export default function ProductImage({ uri, accessibilityLabel }: ProductImageProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showImage = Boolean(uri) && uri !== failedUri;

  return (
    <View style={styles.container}>
      <ImageIcon size={ICON_SIZE.lg} color={colors.iconDisabled} />

      {showImage && (
        <Image
          source={{ uri: uri ?? undefined }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={FADE_DURATION_MS}
          accessibilityLabel={accessibilityLabel}
          onError={() => setFailedUri(uri ?? null)}
        />
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
  });
}
