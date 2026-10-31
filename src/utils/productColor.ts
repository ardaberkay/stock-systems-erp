import { PRODUCT_COLOR_HEX } from '@/constants/productColors';

// Uzun adlar önce denenir ki en özel eşleşme kazansın. "Siyah Kırmızı" gibi iki renkli
// adlarda ilk renk kullanılır.
const COLOR_NAMES = Object.keys(PRODUCT_COLOR_HEX).sort((a, b) => b.length - a.length);

// Eşleşmeyen adlarda (Leopar, mağazanın özel renkleri) null döner; yanlış nokta göstermektense gizlenir.
export function getProductColorHex(colorName: string | null | undefined): string | null {
  const name = colorName?.trim().toLocaleLowerCase('tr');

  if (!name) {
    return null;
  }

  const match = COLOR_NAMES.find((key) => name === key || name.startsWith(`${key} `));

  return match ? PRODUCT_COLOR_HEX[match] : null;
}
