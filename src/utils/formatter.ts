export function formatMoney(value: number, locale: string): string {
  return `₺ ${value.toLocaleString(locale)}`;
}

export function formatNumber(value: number, locale: string): string {
  return value.toLocaleString(locale);
}

// 0.128 → "%12,8"
export function formatPercent(ratio: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(ratio);
}

export function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// 'YYYY-MM-DD' anahtarını "30 Eki" olarak yazar; yerel Date ile kurulduğu için gün kaymaz.
export function formatDayKey(dayKey: string, locale: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

// 'YYYY-MM-DD' → "25.10.26"
export function formatOrderDay(dayKey: string): string {
  const [year, month, day] = dayKey.split('-');

  return `${day}.${month}.${year.slice(2)}`;
}

// 'YYYY-MM-DD HH:MM:SS' → "01.11.26 01:20". Listede yüzlerce kez çağrılır, Intl gerektirmez;
// API saati zaten Türkiye saatidir.
export function formatOrderDateTime(dateTime: string): string {
  const [day, time = ''] = dateTime.split(' ');

  return `${formatOrderDay(day)} ${time.slice(0, 5)}`;
}

// 5451234567 → "0545 123 45 67"; beklenmeyen uzunluk olduğu gibi gösterilir.
export function formatPhone(phone: string): string {
  if (phone.length !== 10) {
    return phone;
  }

  return `0${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
}

// "12 Eki – 18 Eki 2026"; aynı günse tek tarih, yıllar farklıysa iki tarafta da yıl yazılır.
export function formatDateRange(from: Date, to: Date, locale: string): string {
  if (from.toDateString() === to.toDateString()) {
    return formatDate(from, locale);
  }

  const start =
    from.getFullYear() === to.getFullYear()
      ? from.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
      : formatDate(from, locale);

  return `${start} – ${formatDate(to, locale)}`;
}
