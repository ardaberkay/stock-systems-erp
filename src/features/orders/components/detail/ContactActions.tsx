import WhatsAppIcon from '@/features/orders/components/WhatsAppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { normalizePhone } from '@/features/orders/utils/orderList';
import { getWhatsAppUrl } from '@/features/orders/utils/whatsapp';
import Phone from 'lucide-react-native/icons/phone';
import { useTranslation } from 'react-i18next';
import { haptics } from '@/lib/haptics';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

type ContactActionsProps = {
  phone: string;
  whatsappLabel: string;
  whatsappMessage: string;
};

// Simge satır yüksekliğinde kalır, dokunma alanı 44 olur
const HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.sm) / 2;

export default function ContactActions({
  phone,
  whatsappLabel,
  whatsappMessage,
}: ContactActionsProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const openUrl = (url: string, errorKey: string) => {
    Linking.openURL(url).catch(() => {
      haptics.error();
      Alert.alert(t(errorKey));
    });
  };

  return (
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={whatsappLabel}
        hitSlop={HIT_SLOP}
        onPress={() => openUrl(getWhatsAppUrl(phone, whatsappMessage), 'orders.whatsappError')}
      >
        <WhatsAppIcon />
      </Pressable>
      {/* Değerle butonlar arasındaki gibi ince dikey çizgi (bkz. DetailRow) */}
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('orders.detail.call')}
        hitSlop={HIT_SLOP}
        onPress={() => openUrl(`tel:0${normalizePhone(phone)}`, 'orders.detail.callError')}
      >
        <Phone size={ICON_SIZE.sm} color={colors.icon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    // Çizginin iki yanı birlikte (2 × lg) iki dokunma alanının payından (2 × 14) büyük;
    // alanlar birbirine binmez. DetailRow'daki değer–buton boşluğuyla aynı.
    gap: SPACING.lg,
  },
  // Satır yüksekliği kadar uzar
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
});
