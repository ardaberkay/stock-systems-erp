import Text from '@/components/ui/Text';
import WhatsAppIcon from '@/features/orders/components/WhatsAppIcon';
import { normalizePhone } from '@/features/orders/utils/orderList';
import { getWhatsAppUrl } from '@/features/orders/utils/whatsapp';
import type { AppColors } from '@/theme/colors';
import { SOFT_SHADOW } from '@/theme/elevation';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Mail from 'lucide-react-native/icons/mail';
import Phone from 'lucide-react-native/icons/phone';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

type AffiliateQuickActionsProps = {
  name: string;
  phone: string | null | undefined;
  email: string | null | undefined;
  // WhatsApp mesajı ortağın adıyla başlar
  greetingName: string;
  colors: AppColors;
};

type QuickAction = {
  key: string;
  label: string;
  accessibilityLabel: string;
  icon: ReactNode;
  url: string | null;
  errorKey: string;
};

// Profilin altındaki eşit genişlikte butonlar (Ara, WhatsApp, E-posta). Bilgi eksikse buton
// yerinde durur ama soluk ve pasif görünür; düzen ortaktan ortağa kaymaz.
export default function AffiliateQuickActions({
  name,
  phone,
  email,
  greetingName,
  colors,
}: AffiliateQuickActionsProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const actions: QuickAction[] = [
    {
      key: 'call',
      label: t('affiliates.detail.quickActions.call'),
      accessibilityLabel: t('affiliates.detail.callLabel', { name }),
      icon: <Phone size={ICON_SIZE.md} color={phone ? colors.icon : colors.iconDisabled} />,
      url: phone ? `tel:0${normalizePhone(phone)}` : null,
      errorKey: 'orders.detail.callError',
    },
    {
      key: 'whatsapp',
      label: t('affiliates.detail.quickActions.whatsapp'),
      accessibilityLabel: t('affiliates.detail.whatsapp', { name }),
      icon: <WhatsAppIcon size={ICON_SIZE.md} />,
      url: phone
        ? getWhatsAppUrl(phone, t('affiliates.detail.whatsappMessage', { name: greetingName }))
        : null,
      errorKey: 'orders.whatsappError',
    },
    {
      key: 'email',
      label: t('affiliates.detail.quickActions.email'),
      accessibilityLabel: t('affiliates.detail.emailLabel', { name }),
      icon: <Mail size={ICON_SIZE.md} color={email ? colors.icon : colors.iconDisabled} />,
      url: email ? `mailto:${email}` : null,
      errorKey: 'affiliates.detail.emailError',
    },
  ];

  return (
    <View style={styles.row}>
      {actions.map((action) => {
        const { url } = action;
        const disabled = url === null;

        return (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => {
              if (url) Linking.openURL(url).catch(() => Alert.alert(t(action.errorKey)));
            }}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            {/* Marka logosunun rengi değiştirilemediği için pasif WhatsApp kutusu soluklaştırılır */}
            <View style={disabled && action.key === 'whatsapp' ? styles.dimmed : undefined}>
              {action.icon}
            </View>
            <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={1}>
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    // Detaydaki çerçevesiz gruplarla aynı görünüm: beyaz zemin, çerçeve yok, hafif gölge
    button: {
      flex: 1,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.surface,
      ...SOFT_SHADOW,
    },
    // Çerçeve olmadığı için basılınca zemin sayfa rengine döner
    pressed: {
      backgroundColor: colors.background,
    },
    dimmed: {
      opacity: 0.4,
    },
    label: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
    },
    labelDisabled: {
      color: colors.textDisabled,
    },
  });
}
