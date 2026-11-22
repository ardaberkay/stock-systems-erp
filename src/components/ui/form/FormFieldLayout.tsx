import FieldLabel from '@/components/ui/form/FieldLabel';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

// stacked: etiket üstte, alan altında (varsayılan). inline: etiket solda, alan sağda; detayın
// okuma halindeki satırlarla aynı düzen, mod değişince alanlar yerinden oynamaz. Kutu içindeki
// metin sola yaslıdır (yazma ve kaydırma doğal çalışır); yalnızca tutarlar sağa yaslı.
export type FieldLayout = 'stacked' | 'inline';

type FormFieldLayoutProps = {
  label: string;
  required?: boolean;
  layout?: FieldLayout;
  // Alanın altındaki hata veya ipucu; yan yana düzende kutunun altında, kutu genişliğinde
  message?: ReactNode;
  children: ReactNode;
};

// Form alanlarının etiket + alan + mesaj yerleşimi (TextField, PickerField, MultiPickerField,
// LockedField, SegmentedField, PhoneField, StepperField)
export default function FormFieldLayout({
  label,
  required = false,
  layout = 'stacked',
  message,
  children,
}: FormFieldLayoutProps) {
  if (layout === 'inline') {
    return (
      // Oran her satırda aynı (etiket 1, alan 2 pay): alanlar alt alta aynı hizadan başlar.
      // Etiketler kısa (en uzunu "Piyasa fiyatı"); büyük yazıda kendi payında alt satıra iner.
      <View style={styles.inlineRow}>
        <View style={styles.inlineLabel}>
          <FieldLabel label={label} required={required} />
        </View>
        {/* Hata/ipucu kutunun hemen altında, kutuyla aynı hizada: kırmızı çerçeve ile mesaj aynı
            sütunda durur, hangi alana ait olduğu karışmaz */}
        <View style={styles.inlineControl}>
          {children}
          {message}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      {children}
      {message}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: SPACING.xs,
  },
  // Etiket üstten hizalı ve kutu yüksekliğinde ortalanır: altında mesaj açılınca etiket
  // kutunun karşısında kalır, ikisinin ortasına kaymaz
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  inlineLabel: {
    flex: 1,
    minWidth: 0,
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
  },
  inlineControl: {
    flex: 2,
    minWidth: 0,
    gap: SPACING.xs,
  },
});
