import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import { normalizeText } from '@/features/products/utils/productList';

export const AFFILIATE_STATUS = { passive: 0, active: 1 } as const;

export const AFFILIATE_STATUS_FILTERS = ['all', 'active', 'passive'] as const;
export type AffiliateStatusFilter = (typeof AFFILIATE_STATUS_FILTERS)[number];

export const AFFILIATE_SORTS = ['newest', 'oldest', 'nameAsc', 'nameDesc'] as const;
export type AffiliateSort = (typeof AFFILIATE_SORTS)[number];

export type AffiliateFilters = {
  status: AffiliateStatusFilter;
  sort: AffiliateSort;
};

export const DEFAULT_AFFILIATE_FILTERS: AffiliateFilters = { status: 'all', sort: 'newest' };

export function isDefaultAffiliateFilters(filters: AffiliateFilters): boolean {
  return (
    filters.status === DEFAULT_AFFILIATE_FILTERS.status &&
    filters.sort === DEFAULT_AFFILIATE_FILTERS.sort
  );
}

export function getAffiliateFullName(affiliate: Affiliate): string {
  return `${affiliate.firstName ?? ''} ${affiliate.lastName ?? ''}`.trim();
}

// Siparişlerde de ofis adı önce gösterilir; yoksa ad soyad. İkisi de yoksa boş döner.
export function getAffiliateTitle(affiliate: Affiliate): string {
  return affiliate.officeName || getAffiliateFullName(affiliate);
}

// Avatar harfleri: ad soyadın baş harfleri, yoksa başlığın ilk iki kelimesi
export function getAffiliateInitials(affiliate: Affiliate): string {
  const source = getAffiliateFullName(affiliate) || getAffiliateTitle(affiliate);
  const words = source.split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words.slice(0, 1);

  return letters.map((word) => word.charAt(0).toLocaleUpperCase('tr')).join('');
}

export function isAffiliateActive(affiliate: Affiliate): boolean {
  return affiliate.status === AFFILIATE_STATUS.active;
}

// 'YYYY-MM-DD HH:MM:SS' → yerel Date; gün kaymasın diye parçalardan kurulur.
export function parseAffiliateCreateDay(createTime: string | null | undefined): Date | null {
  const [year, month, day] = (createTime ?? '').slice(0, 10).split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function matchesStatus(affiliate: Affiliate, filter: AffiliateStatusFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'active':
      return isAffiliateActive(affiliate);
    case 'passive':
      return !isAffiliateActive(affiliate);
  }
}

// Telefon "0545 123..." biçiminde aranabilsin diye rakamlar ayrıca karşılaştırılır.
function matchesQuery(affiliate: Affiliate, normalizedQuery: string, digits: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const text = normalizeText(
    [getAffiliateFullName(affiliate), affiliate.officeName, affiliate.email].join(' '),
  );
  if (text.includes(normalizedQuery)) {
    return true;
  }

  // Başındaki 0 olmadan saklanıyor (5451234567)
  const phoneQuery = digits.replace(/^0/, '');
  return phoneQuery.length > 0 && (affiliate.phone ?? '').includes(phoneQuery);
}

// Tarihi olmayan kayıt her iki yönde de sona; eşitlikte büyük id (yeni kayıt) önce.
function compareByCreateTime(a: Affiliate, b: Affiliate, direction: 1 | -1): number {
  const aTime = a.createTime ?? '';
  const bTime = b.createTime ?? '';

  if (aTime !== bTime) {
    if (!aTime) return 1;
    if (!bTime) return -1;
    return aTime < bTime ? direction : -direction;
  }
  return b.id - a.id;
}

function compareByName(a: Affiliate, b: Affiliate, direction: 1 | -1): number {
  return direction * getAffiliateTitle(a).localeCompare(getAffiliateTitle(b), 'tr');
}

function compareAffiliates(sort: AffiliateSort) {
  return (a: Affiliate, b: Affiliate) => {
    switch (sort) {
      case 'newest':
        return compareByCreateTime(a, b, 1);
      case 'oldest':
        return compareByCreateTime(a, b, -1);
      case 'nameAsc':
        return compareByName(a, b, 1);
      case 'nameDesc':
        return compareByName(a, b, -1);
    }
  };
}

export function getVisibleAffiliates(
  affiliates: Affiliate[],
  query: string,
  filters: AffiliateFilters,
): Affiliate[] {
  const normalizedQuery = normalizeText(query);
  const digits = query.replace(/\D/g, '');

  return affiliates
    .filter(
      (affiliate) =>
        matchesStatus(affiliate, filters.status) &&
        matchesQuery(affiliate, normalizedQuery, digits),
    )
    .sort(compareAffiliates(filters.sort));
}
