import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import { PAYMENT_FIELDS } from '@/features/affiliates/affiliateList';
import { useTranslation } from 'react-i18next';

type AffiliateBillingSectionProps = {
  // Ödeme sekmesi ödeme bilgilerini, Fatura sekmesi fatura adreslerini gösterir
  kind: 'payments' | 'addresses';
};

// Panelde ödeme bilgileri (IBAN, alıcı, TC) ve fatura adresleri (vergi dairesi vb.) "ekle"
// ile büyüyen listelerdir. API listeyi döndürmüyor (update tek kayıt alanı yazıyor, get
// hiçbirini okumuyor), fatura adresi alanı hiç yok. Şimdilik bir kaydın alanları boş ("—")
// görünür; API listeyi verince her kayıt böyle bir kart olur (backend listesinde).
export default function AffiliateBillingSection({ kind }: AffiliateBillingSectionProps) {
  const { t } = useTranslation();
  const isPayments = kind === 'payments';

  return (
    <DetailSection
      title={t(isPayments ? 'affiliates.edit.sections.payments' : 'affiliates.edit.sections.addresses')}
    >
      {isPayments ? (
        PAYMENT_FIELDS.map((field) => (
          <DetailRow key={field} label={t(`affiliates.edit.fields.${field}`)} value={null} />
        ))
      ) : (
        <DetailRow label={t('affiliates.edit.fields.billingAddress')} value={null} />
      )}
    </DetailSection>
  );
}
