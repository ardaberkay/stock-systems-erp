// Dashboard dönem filtreleri; görünen ad `filters.<anahtar>` çevirisinden gelir.
export const PERIODS = ['today', 'yesterday', 'weekly', 'monthly', 'yearly'] as const;

export type Period = (typeof PERIODS)[number];

// Ya hazır bir dönem ya da kullanıcının seçtiği tarih aralığı (tek gün için from === to).
export type PeriodSelection =
  | { kind: 'preset'; period: Period }
  | { kind: 'range'; from: Date; to: Date };

export const DEFAULT_PERIOD_SELECTION: PeriodSelection = { kind: 'preset', period: 'today' };
