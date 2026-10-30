export function formatMoney(value: number, locale: string): string {
  return `₺ ${value.toLocaleString(locale)}`;
}

export function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
