import { useProducts } from '@/api/products';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { getProductImages } from '@/utils/productList';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import X from 'lucide-react-native/icons/x';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: products } = useProducts();
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(() => {
    const product = products?.find((item) => String(item.id) === id);

    return product ? getProductImages(product) : [];
  }, [products, id]);

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
        data={images}
        keyExtractor={(image) => image}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
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
