import Text from '@/components/ui/Text';
import {
  getAffiliateFullName,
  getAffiliateInitials,
  getAffiliateTitle,
  isAffiliateActive,
} from '@/features/affiliates/affiliateList';
import AffiliateAvatar from '@/features/affiliates/components/AffiliateAvatar';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type AffiliateProfileHeaderProps = {
  affiliate: Affiliate;
  colors: AppColors;
};

// Büyük avatar: dokunma alanından bir boy büyük
const AVATAR_SIZE = MIN_TOUCH_SIZE + SPACING.xl;

// Detayın üstü: ortada avatar ve ad, sağ üst köşede durum
export default function AffiliateProfileHeader({ affiliate, colors }: AffiliateProfileHeaderProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fullName = getAffiliateFullName(affiliate);
  const title = getAffiliateTitle(affiliate) || t('affiliates.unnamed', { id: affiliate.id });
  const subtitle = affiliate.officeName && fullName ? fullName : undefined;
  const isActive = isAffiliateActive(affiliate);

  return (
    <View style={styles.hero}>
      {/* Durum sağ üst köşede; ortadaki ad ve avatarın hizasını bozmaz */}
      <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusPassive]}>
        <View style={[styles.statusDot, isActive ? styles.dotActive : styles.dotPassive]} />
        <Text style={[styles.statusText, isActive ? styles.textActive : styles.textPassive]}>
          {t(isActive ? 'affiliates.status.active' : 'affiliates.status.passive')}
        </Text>
      </View>

      <AffiliateAvatar
        id={affiliate.id}
        initials={getAffiliateInitials(affiliate)}
        isPassive={!isActive}
        size={AVATAR_SIZE}
        large
        colors={colors}
      />
      <View style={styles.texts}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    hero: {
      alignItems: 'center',
      gap: SPACING.md,
      paddingTop: SPACING.lg,
    },
    // Uzun ad sağ üstteki durum etiketinin altına girmesin diye iki yandan boşluk bırakılır
    texts: {
      alignItems: 'center',
      gap: SPACING.xxs,
      paddingHorizontal: SPACING.xxxl,
    },
    title: {
      ...typography.h3,
      textAlign: 'center',
      color: colors.text,
    },
    subtitle: {
      ...typography.bodySmall,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    statusBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
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
      width: SPACING.sm,
      height: SPACING.sm,
      borderRadius: RADIUS.full,
    },
    dotActive: {
      backgroundColor: colors.success,
    },
    dotPassive: {
      backgroundColor: colors.textSecondary,
    },
    statusText: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
    },
    textActive: {
      color: colors.success,
    },
    textPassive: {
      color: colors.textSecondary,
    },
  });
}
