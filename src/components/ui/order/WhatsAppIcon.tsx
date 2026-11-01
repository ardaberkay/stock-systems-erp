import { ICON_SIZE } from '@/theme/spacing';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

const WHATSAPP_LOGO = require('@/assets/images/wapp.png');

// Marka kuralı gereği resmi logo renk ve şekil değiştirilmeden gösterilir.
export default function WhatsAppIcon() {
  return <Image source={WHATSAPP_LOGO} style={styles.icon} contentFit="contain" />;
}

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE.sm,
    height: ICON_SIZE.sm,
  },
});
