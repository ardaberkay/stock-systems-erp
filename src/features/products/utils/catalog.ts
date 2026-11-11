import type { PickerOption } from '@/features/picker/components/PickerField';
import type { CatalogItem, Category } from '@/features/products/schemas/catalog';
import type { Product } from '@/features/products/schemas/products';

// Katalog sayfalarında ürün sayısının okunduğu alan
export type CatalogProductField = 'typeId' | 'brandId' | 'colorId';

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase('tr');
}

// Ürün sayısı yüklü katalogdan sayılır, ek istek atılmaz. Pasif ürünler de sayılır; silinmiş
// ürünler katalogda gelmediği için sayı 0 olan kayıt yine de silinemeyebilir.
export function countProductsBy(products: Product[], field: CatalogProductField) {
  const counts = new Map<number, number>();

  for (const product of products) {
    const id = product[field];
    if (id) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return counts;
}

// Sunucu kayıtları eklenme sırasıyla verir; sayfada alfabetik ve aramaya göre süzülmüş görünür
export function getVisibleCatalogItems(items: CatalogItem[], query: string) {
  const normalizedQuery = normalizeName(query);

  return items
    .filter((item) => normalizeName(item.name).includes(normalizedQuery))
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim(), 'tr'));
}

// Renk kodu zorunlu ve benzersiz; kullanıcıya sorulmaz. 0-999 arasındaki ilk boş kod verilir,
// hepsi doluysa 4 haneli ilk boş kod.
const MAX_COLOR_CODE = 9999;

export function getFreeColorCode(codes: (string | null | undefined)[]) {
  // Boş kod 0 sayılmasın
  const used = new Set(
    codes.flatMap((code) => (code?.trim() ? [Number(code)] : [])).filter(Number.isInteger),
  );

  for (let code = 0; code <= MAX_COLOR_CODE; code += 1) {
    if (!used.has(code)) {
      return String(code);
    }
  }

  return String(MAX_COLOR_CODE + 1);
}

// Sunucu aynı adla ikinci kaydı kabul ediyor; büyük/küçük harf farkı da aynı ad sayılır
export function hasDuplicateName(items: CatalogItem[], name: string, exceptId?: number) {
  const normalized = normalizeName(name);

  return items.some((item) => item.id !== exceptId && normalizeName(item.name) === normalized);
}

// Marka, tip ve renk listeleri seçim penceresinde alfabetik görünür
export function toSortedOptions(items: CatalogItem[]): PickerOption[] {
  return items
    .map((item) => ({ value: item.id, label: item.name.trim() }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'));
}

// Kategoriler panelin sırasıyla gelir. Alt kategori "Üst / Alt" diye yazılır ki aynı adlı
// alt kategoriler karışmasın.
export function getCategoryOptions(categories: Category[], activeStatus: number): PickerOption[] {
  const namesById = new Map(categories.map((category) => [category.id, category.name.trim()]));

  return categories
    // Durumu gelmeyen kategori gizlenmez
    .filter((category) => (category.status ?? activeStatus) === activeStatus)
    .map((category) => {
      const parentName = category.parentId ? namesById.get(category.parentId) : undefined;

      return {
        value: category.id,
        label: parentName ? `${parentName} / ${category.name.trim()}` : category.name.trim(),
      };
    });
}
