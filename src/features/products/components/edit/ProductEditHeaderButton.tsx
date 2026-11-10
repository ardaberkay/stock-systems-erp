import { useAppTheme } from '@/hooks/useAppTheme';
import { ICON_SIZE, MIN_TOUCH_SIZE } from '@/theme/spacing';
import { router } from 'expo-router';
import Pencil from 'lucide-react-native/icons/pencil';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

const EDIT_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.md) / 2;

// Ürün detayının başlığındaki kalem. Sipariş detayındaki gibi rota tanımında verilir ki ilk
// karede yerinde olsun. Düzenleme modu sayfa parametresiyle açılır (karttaki "Düzenle" de edit=1).
export default function ProductEditHeaderButton() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('stock.editMode.title')}
      hitSlop={EDIT_HIT_SLOP}
      onPress={() => router.setParams({ edit: '1' })}
    >
      {/* Başlık çubuğundaki geri oku ve başlıkla aynı renk (headerTintColor) */}
      <Pencil size={ICON_SIZE.md} color={colors.text} />
    </Pressable>
  );
}
