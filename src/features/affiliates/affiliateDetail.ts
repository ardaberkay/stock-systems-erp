// Detay ve düzenlemenin bölümleri (Bilgi / Ödeme / Fatura). Siparişler ayrı sayfadadır (sipariş
// satırı açar); sekmeler ortağın kendi kayıtlarıdır. Görünen adlar
// `affiliates.detail.tabs.<bölüm>` çevirisinden gelir.
export const AFFILIATE_DETAIL_TABS = ['general', 'billing', 'invoices'] as const;

export type AffiliateDetailTab = (typeof AFFILIATE_DETAIL_TABS)[number];
