import type { CargoCompany } from '@/features/orders/schemas/cargo';
import type { TFunction } from 'i18next';

// API'da kısa görünen ad yok: `name` küçük harfli kod, `fullName` uzun ticari unvan. Bilinen
// kodlar kısa adla gösterilir; listede olmayan yeni bir firma unvanıyla görünür.
export function getCargoCompanyName(company: CargoCompany, t: TFunction) {
  return t(`orders.cargoNames.${company.name}`, {
    defaultValue: company.fullName || company.name,
  });
}
