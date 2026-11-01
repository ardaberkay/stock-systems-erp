import { useAffiliates } from '@/api/affiliates';
import { useCargoCompanies } from '@/api/cargo';
import { useOrderCustomStatuses, useOrderPaymentTypes } from '@/api/orders';
import { STORE_PICKUP_CARGO_CODE } from '@/constants/cargo';
import type { Order } from '@/schemas/orders';
import { useMemo } from 'react';

export type OrderPartner = {
  name: string;
  phone: string | null;
};

export type OrderCargo = {
  name: string;
  isStorePickup: boolean;
};

// Kartlardaki kimlikleri ada çevirir. İstekler liste geldikten sonra sıraya girer ki
// siparişler beklemesin; hiçbir siparişte geçmeyen ortak ve özel durum listesi istenmez.
export function useOrderLookups(orders: Order[]) {
  const hasOrders = orders.length > 0;
  const { data: cargoCompanies } = useCargoCompanies({ enabled: hasOrders });
  const { data: paymentTypes } = useOrderPaymentTypes({ enabled: hasOrders });
  const { data: customStatuses } = useOrderCustomStatuses({
    enabled: orders.some((order) => order.orderCustomStatusId !== null),
  });
  const { data: affiliates } = useAffiliates({
    enabled: orders.some((order) => order.affiliateAccountId !== null),
  });

  return useMemo(
    () => ({
      cargos: new Map<number, OrderCargo>(
        (cargoCompanies ?? []).map((company) => [
          company.id,
          {
            name: company.fullName || company.name,
            isStorePickup: company.name === STORE_PICKUP_CARGO_CODE,
          },
        ]),
      ),
      paymentNames: new Map((paymentTypes ?? []).map((type) => [type.id, type.name])),
      customStatusNames: new Map((customStatuses ?? []).map((status) => [status.id, status.name])),
      // Eski siparişte pasif ortak olabilir; seçimde gizlenir ama burada adı görünür.
      partners: new Map<number, OrderPartner>(
        (affiliates ?? []).map((affiliate) => [
          affiliate.id,
          {
            name:
              affiliate.officeName || `${affiliate.firstName ?? ''} ${affiliate.lastName ?? ''}`.trim(),
            phone: affiliate.phone ?? null,
          },
        ]),
      ),
    }),
    [cargoCompanies, paymentTypes, customStatuses, affiliates],
  );
}
