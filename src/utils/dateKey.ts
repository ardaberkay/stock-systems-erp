// Tarihler API ile aynı biçimde 'YYYY-MM-DD' metni olarak taşınır; böylece saat dilimi
// kayması olmaz ve siparişlerin orderDateTime değeriyle doğrudan karşılaştırılabilir.
const DAY_MS = 24 * 60 * 60 * 1000;
// Türkiye'de yaz saati uygulaması yok, fark her zaman UTC+3.
const TURKEY_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

// Cihazın saat dilimi ne olursa olsun Türkiye saati: 'YYYY-MM-DD HH:MM:SS'
export function toTurkeyDateTime(date: Date): string {
  return new Date(date.getTime() + TURKEY_UTC_OFFSET_MS).toISOString().slice(0, 19).replace('T', ' ');
}

// Takvimde seçilen gün olduğu için cihazın yerel tarihi okunur.
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(dayKey: string, days: number): string {
  return new Date(Date.parse(`${dayKey}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

// İki uç da dahil gün sayısı
export function countDays(startDay: string, endDay: string): number {
  return Math.round((Date.parse(`${endDay}T00:00:00Z`) - Date.parse(`${startDay}T00:00:00Z`)) / DAY_MS) + 1;
}

export function listDays(startDay: string, endDay: string): string[] {
  return Array.from({ length: countDays(startDay, endDay) }, (_, index) => addDays(startDay, index));
}
