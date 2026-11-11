import type { PickerOption } from '@/features/picker/components/PickerField';
import {
  CATEGORY_STATUS,
  CATEGORY_VISIBILITY,
  DEFAULT_CATEGORY_SORT,
  ROOT_CATEGORY_ID,
} from '@/features/products/constants/products';
import type { CatalogItem, Category, CategoryForm } from '@/features/products/schemas/catalog';
import type { Product } from '@/features/products/schemas/products';

// Bir ürünün sayıldığı kayıtlar; tip, marka ve renkte tek, kategoride birden çok olabilir.
// Boş alan 0 veya null gelir, sayılmaz.
export type ProductCatalogIds = (product: Product) => (number | null | undefined)[];

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase('tr');
}

// Ürün sayısı yüklü katalogdan sayılır, ek istek atılmaz. Pasif ürünler de sayılır; silinmiş
// ürünler katalogda gelmediği için sayı 0 olan kayıt yine de silinemeyebilir.
export function countProductsBy(products: Product[], getIds: ProductCatalogIds) {
  const counts = new Map<number, number>();

  for (const product of products) {
    for (const id of new Set(getIds(product))) {
      if (id) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
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

// Kategori eklerken ve güncellerken gönderilen alanlar (API adlarıyla)
export type CategoryPayload = {
  name: string;
  parentId: number;
  sortNum: number;
  visibility: number;
  status: number;
  // Sunucu boş metni reddediyor; boşsa hiç gönderilmez
  description?: string;
};

export function getCategoryParentId(category: Category) {
  return category.parentId || ROOT_CATEGORY_ID;
}

export function countChildCategories(categories: Category[], id: number) {
  return categories.filter((category) => getCategoryParentId(category) === id).length;
}

// Kategori ve tüm alt kategorileri. Üst kategori seçiminde bunlar listelenmez; yoksa kategori
// kendi altına taşınıp döngü oluşur.
function getSubtreeIds(categories: Category[], id: number) {
  const ids = new Set([id]);
  let added = true;

  while (added) {
    added = false;
    for (const category of categories) {
      if (!ids.has(category.id) && ids.has(getCategoryParentId(category))) {
        ids.add(category.id);
        added = true;
      }
    }
  }

  return ids;
}

// "Giyim / Üst Giyim" gibi tam yol; aynı adlı alt kategoriler karışmasın
function getCategoryPath(category: Category, byId: Map<number, Category>) {
  const names = [category.name.trim()];
  const seen = new Set([category.id]);
  let parent = byId.get(getCategoryParentId(category));

  // Sahipsiz veya döngülü kayıtta durur
  while (parent && !seen.has(parent.id)) {
    names.unshift(parent.name.trim());
    seen.add(parent.id);
    parent = byId.get(getCategoryParentId(parent));
  }

  return names.join(' / ');
}

// Üst kategori seçenekleri: en başta ana kategori, sonra tam yoluyla alfabetik. Pasif kategoriler
// de seçilebilir; panel de izin veriyor.
export function getParentCategoryOptions(
  categories: Category[],
  rootLabel: string,
  editedId?: number,
): PickerOption[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const excluded = editedId === undefined ? new Set<number>() : getSubtreeIds(categories, editedId);
  const options = categories
    .filter((category) => !excluded.has(category.id))
    .map((category) => ({ value: category.id, label: getCategoryPath(category, byId) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'));

  return [{ value: ROOT_CATEGORY_ID, label: rootLabel }, ...options];
}

// Liste satırının alt yazısı için: üst kategorinin adı (yoksa veya bulunamazsa null = ana
// kategori) ve varsayılandan farklı olan durumlar
export function getCategoryRowInfo(categories: Category[]) {
  const namesById = new Map(categories.map((category) => [category.id, category.name.trim()]));

  return new Map(
    categories.map((category) => [
      category.id,
      {
        parentName: namesById.get(getCategoryParentId(category)) ?? null,
        hidden: category.visibility === CATEGORY_VISIBILITY.hidden,
        passive: category.status === CATEGORY_STATUS.passive,
      },
    ]),
  );
}

// Sunucu aynı üst kategori altında aynı adı reddediyor; farklı üst kategoride izin veriyor
export function hasDuplicateSiblingName(
  categories: Category[],
  name: string,
  parentId: number,
  exceptId?: number,
) {
  return hasDuplicateName(
    categories.filter((category) => getCategoryParentId(category) === parentId),
    name,
    exceptId,
  );
}

export function getCategoryFormDefaults(category?: Category): CategoryForm {
  return {
    name: category?.name.trim() ?? '',
    parentId: category ? getCategoryParentId(category) : ROOT_CATEGORY_ID,
    sortNum: String(category?.sortNum ?? DEFAULT_CATEGORY_SORT),
    description: category?.description?.trim() ?? '',
    // Değeri gelmeyen kategori panelin varsayılanıyla açılır
    visible: (category?.visibility ?? CATEGORY_VISIBILITY.visible) === CATEGORY_VISIBILITY.visible,
    active: (category?.status ?? CATEGORY_STATUS.active) === CATEGORY_STATUS.active,
  };
}

export function toCategoryPayload(values: CategoryForm): CategoryPayload {
  return {
    name: values.name,
    parentId: values.parentId,
    sortNum: Number(values.sortNum),
    visibility: values.visible ? CATEGORY_VISIBILITY.visible : CATEGORY_VISIBILITY.hidden,
    status: values.active ? CATEGORY_STATUS.active : CATEGORY_STATUS.passive,
    ...(values.description ? { description: values.description } : {}),
  };
}

// Düzenlemede yalnızca değişen alanlar gönderilir; hiçbiri değişmediyse boş döner
export function getCategoryChanges(original: Category, values: CategoryForm) {
  const before = toCategoryPayload(getCategoryFormDefaults(original));
  const after = toCategoryPayload(values);
  const changes: Partial<CategoryPayload> = {};

  if (after.name !== before.name) changes.name = after.name;
  if (after.parentId !== before.parentId) changes.parentId = after.parentId;
  if (after.sortNum !== before.sortNum) changes.sortNum = after.sortNum;
  if (after.visibility !== before.visibility) changes.visibility = after.visibility;
  if (after.status !== before.status) changes.status = after.status;
  if (after.description !== undefined && after.description !== before.description) {
    changes.description = after.description;
  }

  return changes;
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
