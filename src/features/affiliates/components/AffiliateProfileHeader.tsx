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

// Avatar dokunma alanından bir boy büyük; yanındaki iki satır metinle aynı hizada durur
const AVATAR_SIZE = MIN_TOUCH_SIZE + SPACING.md;

// Detayın üstü: solda avatar, yanında butik adı, ad soyad ve durum. Sola yaslı düzen ekranda
// daha az yer kaplar; altındaki işlemler ve rakamlar ilk bakışta görünür.
export default function AffiliateProfileHeader({ affiliate, colors }: AffiliateProfileHeaderProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fullName = getAffiliateFullName(affiliate);
  const title = getAffiliateTitle(affiliate) || t('affiliates.unnamed', { id: affiliate.id });
  const subtitle = affiliate.officeName && fullName ? fullName : undefined;
  const isActive = isAffiliateActive(affiliate);

  return (
    <View style={styles.hero}>
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
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusPassive]}>
          <View style={[styles.statusDot, isActive ? styles.dotActive : styles.dotPassive]} />
          <Text style={[styles.statusText, isActive ? styles.textActive : styles.textPassive]}>
            {t(isActive ? 'affiliates.status.active' : 'affiliates.status.passive')}
          </Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.lg,
      paddingTop: SPACING.sm,
    },
    texts: {
      flex: 1,
      alignItems: 'flex-start',
      gap: SPACING.xxs,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.xs,
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
