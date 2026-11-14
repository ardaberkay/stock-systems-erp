import DetailSection from '@/components/ui/DetailSection';
import LockedField from '@/components/ui/form/LockedField';
import TextField from '@/components/ui/form/TextField';
import { isAffiliateActive } from '@/features/affiliates/affiliateList';
import type { AffiliateEditForm } from '@/features/affiliates/schemas/affiliateEdit';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import { formatPhoneGroups, toTrPhoneDigits } from '@/features/orders/utils/phone';
import { SPACING } from '@/theme/spacing';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type AffiliateEditGeneralTabProps = {
  // Kilitli alanlar kayıtlı haliyle gösterilir
  affiliate: Affiliate;
};

type TextFieldName = 'firstName' | 'lastName' | 'officeName' | 'email';

// "555 123 45 67" biçiminde yazılır: boşluklar dahil en fazla 13 karakter
const PHONE_INPUT_MAX_LENGTH = 13;

// subtractionStatus: 1 / 0. Paneldeki karşılığı kullanıcıdan teyit edilecek.
const SUBTRACTION_ON = 1;

// Panelde düzenlenen ama API'nin okumadığı ve yazmadığı alanlar; yerleri hazır, değerleri boş
const PANEL_ONLY_ACCOUNT_FIELDS = ['username', 'password'] as const;
const PANEL_ONLY_SALE_FIELDS = [
  'basePriceChange',
  'canAddAmount',
  'productCommission',
  'deductFromAdded',
] as const;

export default function AffiliateEditGeneralTab({ affiliate }: AffiliateEditGeneralTabProps) {
  const { t } = useTranslation();
  const { control } = useFormContext<AffiliateEditForm>();
  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  const renderText = (
    name: TextFieldName,
    options: { required?: boolean; keyboardType?: 'email-address'; autoCapitalize?: 'none' } = {},
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          label={t(`affiliates.edit.fields.${name}`)}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          required={options.required}
          keyboardType={options.keyboardType}
          autoCapitalize={options.autoCapitalize}
          error={translateError(error?.message)}
        />
      )}
    />
  );

  return (
    <>
      <DetailSection title={t('affiliates.edit.sections.contact')}>
        {renderText('officeName')}
        <View style={styles.row}>
          <View style={styles.half}>{renderText('firstName', { required: true })}</View>
          <View style={styles.half}>{renderText('lastName', { required: true })}</View>
        </View>
        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label={t('affiliates.edit.fields.phone')}
              value={formatPhoneGroups(value)}
              onChangeText={(text) => onChange(toTrPhoneDigits(text))}
              onBlur={onBlur}
              placeholder={t('affiliates.edit.phonePlaceholder')}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={PHONE_INPUT_MAX_LENGTH}
              error={translateError(error?.message)}
            />
          )}
        />
        {renderText('email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
      </DetailSection>

      {/* API bu alanları değiştiremiyor; panelden yapılır */}
      <DetailSection title={t('affiliates.edit.sections.account')}>
        {PANEL_ONLY_ACCOUNT_FIELDS.map((field) => (
          <LockedField key={field} label={t(`affiliates.edit.fields.${field}`)} value={null} />
        ))}
        <LockedField
          label={t('affiliates.edit.fields.status')}
          value={t(
            isAffiliateActive(affiliate) ? 'affiliates.status.active' : 'affiliates.status.passive',
          )}
        />
      </DetailSection>

      <DetailSection title={t('affiliates.edit.sections.sales')}>
        <LockedField
          label={t('affiliates.edit.fields.subtraction')}
          value={t(
            affiliate.subtractionStatus === SUBTRACTION_ON
              ? 'affiliates.edit.on'
              : 'affiliates.edit.off',
          )}
        />
        {PANEL_ONLY_SALE_FIELDS.map((field) => (
          <LockedField key={field} label={t(`affiliates.edit.fields.${field}`)} value={null} />
        ))}
      </DetailSection>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  half: {
    flex: 1,
  },
});
