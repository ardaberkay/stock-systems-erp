import { normalizePhone } from '@/utils/orderList';

const TURKEY_PHONE_DIGITS = 10;

// wa.me bağlantısı uygulama kurulu değilse tarayıcıda açılır; ek izin veya paket gerektirmez.
export function getWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhone(phone);
  const number = digits.length === TURKEY_PHONE_DIGITS ? `90${digits}` : digits;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
