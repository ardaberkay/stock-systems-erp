import { ICON_SIZE } from '@/theme/spacing';
import { Image } from 'expo-image';

const WHATSAPP_LOGO = require('@/assets/images/wapp.png');

type WhatsAppIconProps = {
  // Satır içinde küçük; hızlı işlem butonlarında diğer ikonlarla aynı boyda
  size?: number;
};

// Marka kuralı gereği resmi logo renk ve şekil değiştirilmeden gösterilir.
export default function WhatsAppIcon({ size = ICON_SIZE.sm }: WhatsAppIconProps) {
  return (
    <Image source={WHATSAPP_LOGO} style={{ width: size, height: size }} contentFit="contain" />
  );
}
