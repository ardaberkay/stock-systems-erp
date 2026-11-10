import type { PickerOption } from '@/features/picker/components/PickerField';
import type { CatalogItem, Category } from '@/features/products/schemas/catalog';

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
