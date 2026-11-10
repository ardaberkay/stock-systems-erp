import Text from '@/components/ui/Text';
import ProductImage, { DEFAULT_IMAGE_SIZE } from '@/features/products/components/ProductImage';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import ImagePlus from 'lucide-react-native/icons/image-plus';
import Star from 'lucide-react-native/icons/star';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type ProductImagesRowProps = {
  images: string[];
  productName: string;
  // Görsele dokununca galeri o görselden açılır
  onImagePress: (index: number) => void;
  // Düzenlemede verilir: kapak olmayan görsellerin yıldızına basınca o görsel kapak olur
  onSetCover?: (index: number) => void;
  // Düzenlemede verilir: hiç görsel yoksa metin yerine görsel ekleme kutusu görünür
  onAddImage?: () => void;
};

// Ürün görselleri yan yana, yana kaydırılır; ilki kapaktır ve dolu yıldız taşır.
// En fazla 8 görsel olduğu için FlatList gerekmez.
export default function ProductImagesRow({
  images,
  productName,
  onImagePress,
  onSetCover,
  onAddImage,
}: ProductImagesRowProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (images.length === 0) {
    if (onAddImage) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('stock.editMode.addImage')}
          onPress={onAddImage}
          style={styles.addTile}
        >
          <ImagePlus size={ICON_SIZE.lg} color={colors.icon} />
        </Pressable>
      );
    }

    return <Text style={styles.empty}>{t('stock.detail.noImages')}</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {images.map((uri, index) => {
        const isCover = index === 0;
        const label = t('stock.detail.imageLabel', { index: index + 1, name: productName });
        const star = (
          <View style={styles.starBubble}>
            {isCover ? (
              <Star size={ICON_SIZE.sm} color={colors.orange} fill={colors.orange} />
            ) : (
              // Boş turuncu: kapak yapılabilir; dolu turuncu: kapak
              <Star size={ICON_SIZE.sm} color={colors.orange} />
            )}
          </View>
        );

        return (
          <View key={uri}>
            <Pressable
              accessibilityRole="imagebutton"
              accessibilityLabel={isCover ? `${label}, ${t('stock.detail.cover')}` : label}
              accessibilityHint={t('stock.viewImages')}
              onPress={() => onImagePress(index)}
            >
              <ProductImage uri={uri} accessibilityLabel={label} />
            </Pressable>

            {/* Kapak hep yıldızlı; düzenlemede diğerlerinin boş yıldızı kapak yapar */}
            {onSetCover && !isCover ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t('stock.editMode.makeCover')}, ${label}`}
                onPress={() => onSetCover(index)}
                style={styles.starButton}
              >
                {star}
              </Pressable>
            ) : isCover ? (
              <View style={styles.starButton} pointerEvents="none">
                {star}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      gap: SPACING.sm,
    },
    // Dokunma alanı 44; ikon görselin sağ üst köşesine yakın durur
    starButton: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'flex-end',
      padding: SPACING.xs,
    },
    // Görselin üstünde durduğu için temadan bağımsız açık renk
    starBubble: {
      padding: SPACING.xxs,
      borderRadius: RADIUS.full,
      backgroundColor: colors.imageBadge,
    },
    addTile: {
      width: DEFAULT_IMAGE_SIZE,
      height: DEFAULT_IMAGE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.iconDisabled,
    },
    empty: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
  });
}
