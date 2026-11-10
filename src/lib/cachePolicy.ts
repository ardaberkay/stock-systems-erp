const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Tüm önbellek süreleri burada. Sorgular `...CACHE.orders` gibi yayarak kullanır.
// staleTime: Ekrana bakıldığında veri en fazla ne kadar eski olabilir. Süre dolunca veri ekranda
//   kalır, ekran odağa geldiğinde veya uygulama öne geldiğinde arkada yenilenir (skeleton yok).
// gcTime: Hiçbir ekranın kullanmadığı veri bellekte ne kadar tutulur; tekrar açılan ekran beklemez.
// Aşağı çekip yenileme ve uygulama içi değişiklikler (invalidate) bu sürelere bakmaz.
export const CACHE = {
  // Dönem listeleri ve numara/telefon araması; siparişler panelden ve pazaryerlerinden sürekli gelir
  orders: { staleTime: 5 * MINUTE, gcTime: HOUR },
  orderSearch: { staleTime: 5 * MINUTE },
  orderDetail: { staleTime: 5 * MINUTE, gcTime: HOUR },
  // Katalog stok içerir ama büyük bir yanıttır (~1 MB); uygulama içi sipariş zaten anında yeniler
  products: { staleTime: 10 * MINUTE, gcTime: HOUR },
  // Ödeme türü, özel durum, kargo firması, satış ortağı, şehir/ilçe: neredeyse hiç değişmez
  lookups: { staleTime: DAY, gcTime: DAY },
  // Marka, tip, renk, kategori: panelde yeni eklenen bir saat içinde formda görünsün
  productOptions: { staleTime: HOUR, gcTime: DAY },
} as const;

// Siparişler ve dashboard açık bırakılıp izlenen ekranlar; görünürken siparişler bu aralıkla
// arkada yenilenir. Ekran odakta değilken veya uygulama arka plandayken durur.
export const ORDER_AUTO_REFRESH_MS = 5 * MINUTE;
