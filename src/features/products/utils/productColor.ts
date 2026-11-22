import { PRODUCT_COLOR_HEX } from '@/features/products/constants/productColors';

// Noktanın renkleri: tek renkte yalnızca primary, "Siyah Beyaz" gibi adlarda ikisi
export type ProductColorSwatch = {
  primary: string;
  secondary: string | null;
};

// Tablodaki en uzun ad kaç kelime; daha uzun öbek denemeye gerek yok
const MAX_KEY_WORDS = Math.max(...Object.keys(PRODUCT_COLOR_HEX).map((key) => key.split(' ').length));

// Önek tabandaki rengi açar ya da koyulaştırır: "Koyu Vizon", "Açık Lacivert"
const MODIFIERS: Record<string, number> = {
  açık: 0.35,
  pastel: 0.45,
  soft: 0.3,
  koyu: -0.3,
};

// İyelik ekli renk adı: tek başınaysa tabandaki renk ("Anadolu Siyahı" → siyah); bir rengin
// hemen ardındaysa adın parçasıdır ve atlanır ("Zeytin Yeşili" → zeytin)
const POSSESSIVE_BASES: Record<string, string | null> = {
  siyahı: 'siyah',
  beyazı: 'beyaz',
  sarısı: 'sarı',
  mavisi: 'mavi',
  yeşili: 'yeşil',
  grisi: 'gri',
  pembesi: 'pembe',
  kırmızısı: 'kırmızı',
  moru: 'mor',
  turuncusu: 'turuncu',
  kahvesi: 'kahve',
  rengi: null,
};

function mixHex(hex: string, amount: number): string {
  const target = amount > 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16);

    return Math.round(value + (target - value) * ratio)
      .toString(16)
      .padStart(2, '0');
  });

  return `#${channels.join('')}`.toUpperCase();
}

// Kelimeleri soldan okur, en fazla iki renk bulur. Tanınmayan kelimeler (Çizgili, Ekose,
// Leopar, Zambak…) desen ya da model adıdır, atlanır.
function findColors(words: string[]): string[] {
  const found: string[] = [];
  let modifier = 0;
  let index = 0;

  while (index < words.length && found.length < 2) {
    let matchLength = 0;

    for (let length = Math.min(MAX_KEY_WORDS, words.length - index); length > 0; length -= 1) {
      if (Object.hasOwn(PRODUCT_COLOR_HEX, words.slice(index, index + length).join(' '))) {
        matchLength = length;
        break;
      }
    }

    const word = words[index];

    if (matchLength > 0) {
      const hex = PRODUCT_COLOR_HEX[words.slice(index, index + matchLength).join(' ')];
      found.push(modifier ? mixHex(hex, modifier) : hex);
      modifier = 0;
      index += matchLength;

      // "Zeytin Yeşili", "Taş Rengi": ek almış kelime önceki rengin parçası
      if (index < words.length && Object.hasOwn(POSSESSIVE_BASES, words[index])) {
        index += 1;
      }
      continue;
    }

    if (Object.hasOwn(MODIFIERS, word)) {
      modifier = MODIFIERS[word];
    } else if (Object.hasOwn(POSSESSIVE_BASES, word)) {
      const base = POSSESSIVE_BASES[word];

      if (base) {
        found.push(modifier ? mixHex(PRODUCT_COLOR_HEX[base], modifier) : PRODUCT_COLOR_HEX[base]);
        modifier = 0;
      }
    }
    index += 1;
  }

  return found;
}

// Eşleşmeyen adlarda (Leopar, mağazanın özel adları) null döner; nokta boş halka çizilir.
export function getProductColorSwatch(
  colorName: string | null | undefined,
): ProductColorSwatch | null {
  const words = (colorName ?? '')
    .toLocaleLowerCase('tr')
    // "Antrasit-Pembe", "Siyah/Beyaz", "Siyah & Beyaz" iki renkli adın yazım biçimleri
    .replace(/[-–/&+,]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0 && word !== 've');

  const [primary, secondary] = findColors(words);

  if (!primary) {
    return null;
  }

  return { primary, secondary: secondary && secondary !== primary ? secondary : null };
}
