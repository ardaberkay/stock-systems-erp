import { useProduct } from '@/features/products/api/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { getProductImages } from '@/features/products/utils/productList';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import X from 'lucide-react-native/icons/x';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Ürün fotoğrafları çoğunlukla dikey; bu alanın dışına dokunmak galeriyi kapatır.
const IMAGE_ASPECT_RATIO = 0.75;

const close = () => router.back();

// Ürün görselleri tam ekran; yana kaydırarak gezilir.
export default function ProductImagesModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  // index: detay sayfasında dokunulan görsel; galeri oradan açılır
  const { id, index } = useLocalSearchParams<{ id: string; index?: string }>();
  // Katalog bellekteyse oradan gelir; sipariş detayından açılan üründe katalog olmayabilir
  const { data: product } = useProduct(Number(id));
  const images = product ? getProductImages(product) : [];
  const [startIndex] = useState(() => Math.max(Number(index) || 0, 0));
  const [activeIndex, setActiveIndex] = useState(startIndex);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.counter}>
          {images.length > 1
            ? t('stock.imageCounter', { current: activeIndex + 1, total: images.length })
            : ''}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={close}
          style={styles.closeButton}
        >
          <X size={ICON_SIZE.lg} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        // Ürün sonradan yüklenirse liste yeniden kurulur ki başlangıç görseline atlansın
        key={images.length}
        data={images}
        keyExtractor={(image) => image}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // Her sayfa ekran genişliğinde; başlangıç görseline ölçmeden atlanır
        initialScrollIndex={startIndex < images.length ? startIndex : 0}
        getItemLayout={(_, itemIndex) => ({ length: width, offset: width * itemIndex, index: itemIndex })}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <Pressable accessible={false} onPress={close} style={[styles.page, { width }]}>
            {/* İç alan dokunuşu yakalar; görselin üstüne basmak galeriyi kapatmaz */}
            <Pressable accessible={false} style={{ width, aspectRatio: IMAGE_ASPECT_RATIO }}>
              <Image
                source={{ uri: item }}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.xl,
    },
    counter: {
      ...typography.label,
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.semiBold,
    },
    closeButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    page: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
