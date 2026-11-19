import type { DetailSectionVariant } from "@/components/ui/DetailSection";
import type { ProductEditFormInput } from "@/features/products/schemas/productEdit";

// Ürün detayının okuma halindeki bölümler: çerçevesiz beyaz gruplar. Düzenleme hali çerçeveli
// kart (DetailSection varsayılanı) kullanır.
export const PRODUCT_DETAIL_SECTION_VARIANT: DetailSectionVariant = "plain";

// Detay ve düzenleme sayfasının bölümleri; ürün eklemenin adımlarıyla aynı sırada.
// Görünen adlar `stock.detail.tabs.<bölüm>` çevirisinden gelir.
export const PRODUCT_DETAIL_TABS = ["info", "price", "variants"] as const;

export type ProductDetailTab = (typeof PRODUCT_DETAIL_TABS)[number];

// Hatalı alanın hangi bölümde olduğu; bölüm başlığındaki nokta ve "Kaydet"teki geçiş için
export const PRODUCT_EDIT_TAB_FIELDS: Record<
  ProductDetailTab,
  (keyof ProductEditFormInput)[]
> = {
  info: ["name", "brandId", "typeId", "categoryIds", "description", "active"],
  price: ["salePrice", "listPrice", "costPrice", "costPrice2", "taxRate"],
  variants: ["images", "variants"],
};
