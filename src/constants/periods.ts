// Dashboard dönem filtreleri; görünen ad `filters.<anahtar>` çevirisinden gelir.
// weekly son 7 günü, monthly son 30 günü kapsar; ikisi de bugünü içerir.
export const PERIODS = ['today', 'yesterday', 'weekly', 'monthly'] as const;

export type Period = (typeof PERIODS)[number];

// Ya hazır bir dönem ya da kullanıcının seçtiği tarih aralığı (tek gün için from === to).
export type PeriodSelection =
  | { kind: 'preset'; period: Period }
  | { kind: 'range'; from: Date; to: Date };

export const DEFAULT_PERIOD_SELECTION: PeriodSelection = { kind: 'preset', period: 'today' };

// API tek istekte en fazla 30 gün kabul eder (MaxQueryRangeIs30Days).
export const MAX_RANGE_DAYS = 30;
