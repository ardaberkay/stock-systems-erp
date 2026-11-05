import { DEFAULT_PHONE_COUNTRY, getPhoneDial } from '@/constants/phoneCountries';
import { normalizePhone } from '@/utils/orderList';

const TR_PHONE_DIGITS = 10;
const KKTC_PREFIX = '392';
const KKTC_LOCAL_DIGITS = 7;
// ITU: ülke kodu hariç numara en fazla 14, pratikte en az 6 hane
const FOREIGN_MIN_DIGITS = 6;
const FOREIGN_MAX_DIGITS = 14;

// API'ye gidecek telefon; geçersizse null.
// Türkiye: panel ve kayıtlı siparişler gibi 10 hane (5xx…), başındaki 0 veya +90 atılır.
// KKTC: Türkiye biçiminde 392 ile başlayan 10 hane.
// Diğer ülkeler: "+<kod><numara>". API'nin yabancı numarayı nasıl beklediği test edilmedi.
export function toApiPhone(country: string, input: string): string | null {
  const digits = input.replace(/\D/g, '');

  if (country === DEFAULT_PHONE_COUNTRY) {
    const phone = normalizePhone(digits);

    return phone.length === TR_PHONE_DIGITS ? phone : null;
  }

  if (country === 'KKTC') {
    if (digits.length === KKTC_LOCAL_DIGITS) {
      return `${KKTC_PREFIX}${digits}`;
    }
    const phone = normalizePhone(digits);

    return phone.length === TR_PHONE_DIGITS && phone.startsWith(KKTC_PREFIX) ? phone : null;
  }

  const dial = getPhoneDial(country).replace(/\s/g, '');
  // Kullanıcı kodu da yazdıysa veya başa 0 koyduysa atılır
  const withoutDial = digits.startsWith(dial) && digits.length - dial.length >= FOREIGN_MIN_DIGITS
    ? digits.slice(dial.length)
    : digits;
  const national = withoutDial.replace(/^0+/, '');

  if (!dial || national.length < FOREIGN_MIN_DIGITS || national.length > FOREIGN_MAX_DIGITS) {
    return null;
  }

  return `+${dial}${national}`;
}
