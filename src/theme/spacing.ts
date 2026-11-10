// padding, margin ve gap değerleri
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// borderRadius değerleri
export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

export const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

// Dokunulabilir öğelerin minimum genişlik/yüksekliği
export const MIN_TOUCH_SIZE = 44;

// Tablette içerik bu genişlikte ortalanır; telefonlar daha dar olduğu için etkilenmez.
export const CONTENT_MAX_WIDTH = 720;

// Her ekranın kök stiline yayılır (`...SCREEN_CONTENT`); tablette kartlar ve formlar uzamaz.
export const SCREEN_CONTENT = {
  width: '100%',
  maxWidth: CONTENT_MAX_WIDTH,
  alignSelf: 'center',
} as const;
