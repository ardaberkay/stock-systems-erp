import Text from '@/components/ui/Text';
import {
  getAffiliateFullName,
  getAffiliateInitials,
  getAffiliateTitle,
  isAffiliateActive,
  parseAffiliateCreateDay,
} from '@/features/affiliates/affiliateList';
import AffiliateAvatar from '@/features/affiliates/components/AffiliateAvatar';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatDate, formatOrderDay, formatPhone } from '@/utils/formatter';
import Phone from 'lucide-react-native/icons/phone';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

type AffiliateCardProps = {
  affiliate: Affiliate;
  onPress: (id: number) => void;
  colors: AppColors;
  locale: string;
};

// Uzun listede her kart aynı stili kullanır; her kartta yeniden oluşturulmasın.
const stylesByTheme = new WeakMap<AppColors, ReturnType<typeof createStyles>>();

function getStyles(colors: AppColors) {
  const cached = stylesByTheme.get(colors);

  if (cached) {
    return cached;
  }

  const styles = createStyles(colors);
  stylesByTheme.set(colors, styles);
  return styles;
}

function AffiliateCard({ affiliate, onPress, colors, locale }: AffiliateCardProps) {
  const { t } = useTranslation();
  const styles = getStyles(colors);
  const fullName = getAffiliateFullName(affiliate);
  const title = getAffiliateTitle(affiliate) || t('affiliates.unnamed', { id: affiliate.id });
  // Başlık ofis adıysa altında kişinin adı yazılır
  const subtitle = affiliate.officeName && fullName ? fullName : undefined;
  const isPassive = !isAffiliateActive(affiliate);
  const statusText = t(isPassive ? 'affiliates.status.passive' : 'affiliates.status.active');
  const createDay = parseAffiliateCreateDay(affiliate.createTime);
  // Sipariş kartlarındaki gibi kısa sayısal tarih: "30.09.25"
  const createText =
    createDay && affiliate.createTime ? formatOrderDay(affiliate.createTime.slice(0, 10)) : undefined;
  // Ekran okuyucu kısa sayıyı iyi okumaz; tam tarihi okur
  const createLabel = createDay ? formatDate(createDay, locale) : undefined;
  const phoneText = affiliate.phone ? formatPhone(affiliate.phone) : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        subtitle,
        statusText,
        phoneText,
        createLabel ? t('affiliates.createdAt', { date: createLabel }) : undefined,
      ]
        .filter(Boolean)
        .join(', ')}
      accessibilityHint={t('affiliates.openHint')}
      onPress={() => onPress(affiliate.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <AffiliateAvatar
          id={affiliate.id}
          initials={getAffiliateInitials(affiliate)}
          isPassive={isPassive}
          size={MIN_TOUCH_SIZE}
          colors={colors}
        />

        <View style={styles.texts}>
          {/* Durum, başlık hizasında sağ üstte; başlık uzunsa kısalır, rozet yerinde kalır */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <View style={[styles.statusBadge, isPassive ? styles.statusPassive : styles.statusActive]}>
              <View style={[styles.statusDot, isPassive ? styles.dotPassive : styles.dotActive]} />
              <Text style={[styles.statusText, isPassive ? styles.textPassive : styles.textActive]}>
                {statusText}
              </Text>
            </View>
          </View>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Telefon solda, kayıt tarihi karşısında sağ altta */}
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Phone size={ICON_SIZE.sm} color={colors.icon} />
          <Text style={[styles.metaText, !phoneText && styles.metaEmpty]} numberOfLines={1}>
            {phoneText ?? t('affiliates.noPhone')}
          </Text>
        </View>

        {createText && (
          <Text style={[styles.metaText, styles.metaEnd]} numberOfLines={1}>
            {createText}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default memo(AffiliateCard);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      gap: SPACING.md,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.card.border,
      backgroundColor: colors.card.background,
    },
    pressed: {
      borderColor: colors.textDisabled,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    texts: {
      flex: 1,
      minWidth: 0,
      gap: SPACING.xxs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    title: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      flexShrink: 1,
      color: colors.text,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    // Detay sayfasındaki durum etiketinin küçüğü: aktif yeşil, pasif gri
    statusBadge: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: RADIUS.full,
    },
    statusActive: {
      backgroundColor: colors.successBackground,
    },
    statusPassive: {
      backgroundColor: colors.divider,
    },
    statusDot: {
      width: SPACING.xs + SPACING.xxs,
      height: SPACING.xs + SPACING.xxs,
      borderRadius: RADIUS.full,
    },
    dotActive: {
      backgroundColor: colors.success,
    },
    dotPassive: {
      backgroundColor: colors.textSecondary,
    },
    statusText: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
    },
    textActive: {
      color: colors.success,
    },
    textPassive: {
      color: colors.textSecondary,
    },
    // İnce çizginin altında telefon solda, kayıt tarihi sağda; yazı büyüyüp sığmazsa tarih
    // alt satıra iner ve yine sağa yaslı kalır
    footer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      paddingTop: SPACING.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      flexShrink: 1,
    },
    metaEnd: {
      marginLeft: 'auto',
    },
    metaText: {
      ...typography.label,
      color: colors.textSecondary,
    },
    metaEmpty: {
      color: colors.textDisabled,
    },
  });
}
