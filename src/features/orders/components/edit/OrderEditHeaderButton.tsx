import { useAppBarIconColors } from '@/hooks/useAppBarIconColors';
import { ICON_SIZE, MIN_TOUCH_SIZE } from '@/theme/spacing';
import { router } from 'expo-router';
import Pencil from 'lucide-react-native/icons/pencil';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

const EDIT_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.md) / 2;

// Sipariş detayının başlığındaki kalem. Rota tanımında verilir ki ilk karede yerinde olsun;
// sayfa içinden sonradan eklenince native başlık yeniden düzenlenip titriyordu.
// Düzenleme modu sayfa parametresiyle açılır (listedeki kalemler de edit=1 ile gelir).
export default function OrderEditHeaderButton() {
  const { t } = useTranslation();
  const { icon } = useAppBarIconColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('orders.editTitle')}
      hitSlop={EDIT_HIT_SLOP}
      onPress={() => router.setParams({ edit: '1' })}
    >
      {/* Geri okuyla aynı renk (bkz. useAppBarIconColors) */}
      <Pencil size={ICON_SIZE.md} color={icon} />
    </Pressable>
  );
}
