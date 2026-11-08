import { DEFAULT_PHONE_COUNTRY, getPhoneDial } from '@/constants/phoneCountries';
import { normalizePhone } from '@/utils/orderList';

const TR_PHONE_DIGITS = 10;
const KKTC_PREFIX = '392';
const KKTC_LOCAL_DIGITS = 7;
// ITU: ülke kodu hariç numara en fazla 14, pratikte en az 6 hane
const FOREIGN_MIN_DIGITS = 6;
const FOREIGN_MAX_DIGITS = 14;

// Yazılan metinden numaranın haneleri; baştaki 0 / 90 atılır, en fazla 10 hane kalır
export function toTrPhoneDigits(input: string): string {
  const digits = input.replace(/\D/g, '');

  // Yalnızca sıfırdan oluşan numara (0000000000) kabul edilen bir yer tutucu; sıfırları atılmaz
  if (/^0+$/.test(digits)) {
    return digits.slice(0, TR_PHONE_DIGITS);
  }

  const withoutCountry =
    digits.startsWith('90') && digits.length > TR_PHONE_DIGITS ? digits.slice(2) : digits;

  return withoutCountry.replace(/^0+/, '').slice(0, TR_PHONE_DIGITS);
}

// "5551234567" → "555 123 45 67"; yazarken de gruplanır ki hata gözle görülsün
export function formatPhoneGroups(digits: string): string {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
    .filter(Boolean)
    .join(' ');
}

// Müşteri numara vermediğinde panelde yazılan yer tutucular; geçerli sayılır
const PLACEHOLDER_PHONES = ['0000000000', '5555555555'];

// Türkiye cep numarası: 10 hane, 5 ile başlar. Bütün haneleri aynı olan numara spam sayılır
// (1111111111 gibi); yalnızca yer tutucular bunun dışındadır.
export function isValidTrMobile(digits: string): boolean {
  if (PLACEHOLDER_PHONES.includes(digits)) {
    return true;
  }

  return (
    digits.length === TR_PHONE_DIGITS && digits.startsWith('5') && !/^(\d)\1+$/.test(digits)
  );
}

// API'ye gidecek telefon; geçersizse null.
// Türkiye: panel ve kayıtlı siparişler gibi 10 hane (5xx…), başındaki 0 veya +90 atılır.
// KKTC: Türkiye biçiminde 392 ile başlayan 10 hane.
// Diğer ülkeler: "+<kod><numara>". API'nin yabancı numarayı nasıl beklediği test edilmedi.
export function toApiPhone(country: string, input: string): string | null {
  const digits = input.replace(/\D/g, '');

  if (country === DEFAULT_PHONE_COUNTRY) {
    const phone = toTrPhoneDigits(digits);

    return isValidTrMobile(phone) ? phone : null;
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
