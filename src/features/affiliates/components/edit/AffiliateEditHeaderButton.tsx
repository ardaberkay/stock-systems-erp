import { useAppTheme } from '@/hooks/useAppTheme';
import { ICON_SIZE, MIN_TOUCH_SIZE } from '@/theme/spacing';
import { router } from 'expo-router';
import Pencil from 'lucide-react-native/icons/pencil';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

const EDIT_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.md) / 2;

// Satış ortağı detayının başlığındaki kalem. Ürün detayındaki gibi rota tanımında verilir ki ilk
// karede yerinde olsun; düzenleme modu sayfa parametresiyle (edit=1) açılır.
export default function AffiliateEditHeaderButton() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('affiliates.edit.title')}
      hitSlop={EDIT_HIT_SLOP}
      onPress={() => router.setParams({ edit: '1' })}
    >
      {/* Başlık çubuğundaki geri oku ve başlıkla aynı renk (headerTintColor) */}
      <Pencil size={ICON_SIZE.md} color={colors.text} />
    </Pressable>
  );
}
