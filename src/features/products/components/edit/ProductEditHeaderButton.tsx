import { useAppBarIconColors } from '@/hooks/useAppBarIconColors';
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
  const { icon } = useAppBarIconColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('stock.editMode.title')}
      hitSlop={EDIT_HIT_SLOP}
      onPress={() => router.setParams({ edit: '1' })}
    >
      {/* Geri okuyla aynı renk (bkz. useAppBarIconColors) */}
      <Pencil size={ICON_SIZE.md} color={icon} />
    </Pressable>
  );
}
