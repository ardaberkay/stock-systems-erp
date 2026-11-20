import DetailSection from '@/components/ui/DetailSection';
import LockedField from '@/components/ui/form/LockedField';
import TextField from '@/components/ui/form/TextField';
import {
  isAffiliateActive,
  isAffiliateSubtractionOn,
  PANEL_ONLY_ACCOUNT_FIELDS,
  PANEL_ONLY_SALE_FIELDS,
} from '@/features/affiliates/affiliateList';
import type { AffiliateEditForm } from '@/features/affiliates/schemas/affiliateEdit';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import {
  formatPhoneGroups,
  toTrPhoneDigits,
  TR_PHONE_INPUT_MAX_LENGTH,
} from '@/features/orders/utils/phone';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type AffiliateEditGeneralTabProps = {
  // Kilitli alanlar kayıtlı haliyle gösterilir
  affiliate: Affiliate;
};

type TextFieldName = 'firstName' | 'lastName' | 'officeName' | 'email';

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
          layout="inline"
        />
      )}
    />
  );

  // Alanlar okuma halindeki satırlarla aynı sırada ve yan yana (etiket solda)
  return (
    <>
      <DetailSection title={t('affiliates.edit.sections.contact')}>
        {renderText('officeName')}
        {renderText('firstName', { required: true })}
        {renderText('lastName', { required: true })}
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
              maxLength={TR_PHONE_INPUT_MAX_LENGTH}
              error={translateError(error?.message)}
              layout="inline"
            />
          )}
        />
        {renderText('email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
      </DetailSection>

      {/* API bu alanları değiştiremiyor; panelden yapılır */}
      <DetailSection title={t('affiliates.edit.sections.account')}>
        {PANEL_ONLY_ACCOUNT_FIELDS.map((field) => (
          <LockedField
            key={field}
            label={t(`affiliates.edit.fields.${field}`)}
            value={null}
            layout="inline"
          />
        ))}
        <LockedField
          label={t('affiliates.edit.fields.status')}
          value={t(
            isAffiliateActive(affiliate) ? 'affiliates.status.active' : 'affiliates.status.passive',
          )}
          layout="inline"
        />
      </DetailSection>

      <DetailSection title={t('affiliates.edit.sections.sales')}>
        <LockedField
          label={t('affiliates.edit.fields.subtraction')}
          value={t(isAffiliateSubtractionOn(affiliate) ? 'affiliates.edit.on' : 'affiliates.edit.off')}
          layout="inline"
        />
        {PANEL_ONLY_SALE_FIELDS.map((field) => (
          <LockedField
            key={field}
            label={t(`affiliates.edit.fields.${field}`)}
            value={null}
            layout="inline"
          />
        ))}
      </DetailSection>
    </>
  );
}
