export function formatMoney(value: number, locale: string): string {
    return `₺ ${value.toLocaleString(locale)}`;
  }
  
  export function formatDateTime(date: Date, locale: string): string {
    return `${date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} · ${date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })}`;
  }