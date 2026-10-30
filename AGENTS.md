# stock-erp — Proje Kuralları

Bu bir Expo / React Native mobil ERP uygulamasıdır. Hedef: projeyi büyütüp gerçek kullanıcılara sunmak. Mobil öncelikli kalıpları, performansı ve platformlar arası uyumluluğu gözet.

Bu dosyadaki kurallar hem geliştiriciler hem de yapay zekâ asistanları için **bağlayıcıdır**. Bir kuralın dışına çıkmak gerekiyorsa önce proje sahibine sorulur, onay alınmadan uygulanmaz.

---

## 1. Onaylı teknoloji listesi

Her ihtiyaç için **yalnızca** aşağıdaki araç kullanılır. Listede olmayan bir paket, kütüphane veya alternatif yaklaşım **proje sahibinin açık onayı olmadan eklenmez** (ör. Redux, MobX, Context ile global state, Formik, Yup, axios, styled-components, moment, lodash…).

| İhtiyaç | Kullanılacak | Kullanılmayacak |
|---|---|---|
| Navigasyon | `expo-router` | React Navigation'ı doğrudan kullanmak |
| Sunucu verisi (fetch, cache, loading/error) | `@tanstack/react-query` | `useEffect` + `useState` ile veri çekmek, sunucu verisini zustand'da tutmak |
| Global istemci state'i | `zustand` | Redux, MobX, Jotai, global React Context |
| Formlar | `react-hook-form` + `@hookform/resolvers/zod` | Formik, her input için ayrı `useState` |
| Doğrulama ve API tipleri | `zod` | Yup, elle yazılmış doğrulama |
| HTTP | `src/lib/apiClient.ts` (fetch sarmalayıcı) | axios, ekranlarda doğrudan `fetch` |
| Çoklu dil | `i18next` + `react-i18next`, cihaz dili için `expo-localization` | Koda gömülü metin |
| UI bileşenleri | Kendi bileşenlerimiz: `src/components/ui` | panelui-native bileşenleri (grafik ve takvim hariç), başka UI kütüphanesi |
| Tarih (aralığı) seçici | `panelui-native` `Calendar` (yalnızca `src/components/ui/DateRangePicker.tsx` sarmalayıcısı üzerinden; gün bazında seçilir, saat seçtirilmez) | Başka picker kütüphanesi |
| Stil | `StyleSheet.create` + `src/theme` token'ları | `className` / Tailwind sınıfları, styled-components |
| Grafik | `panelui-native` grafikleri (`LineChart` vb.) | Başka chart kütüphanesi |
| Sekme çubuğu | `expo-router/native-tabs` (iOS 26+ Liquid Glass varsayılan gelir) | JS tabanlı tab bar |
| Yan menü (drawer) | `expo-router/drawer` — platform varsayılanları: iOS `slide` (ekranı iter), Android `front` (üstüne biner). Ayarlar drawer içindedir | `@react-navigation/drawer`'ı doğrudan kurmak, panelui drawer |
| Kalıcı tercihler (tema, dil vb.) | `@react-native-async-storage/async-storage` (zustand `persist` ile) | Hassas veriyi AsyncStorage'da tutmak |
| Lint | `eslint` + `eslint-config-expo` (`npx expo lint`) | Başka lint ayarları |
| Hassas veri (token vb.) | `expo-secure-store` | AsyncStorage'da token tutmak |
| Görseller | `expo-image` | React Native `Image` |
| Animasyon | `react-native-reanimated` | `Animated` API |
| Fontlar | `@expo-google-fonts/inter` (`FONT_FAMILY` üzerinden) | Sistem fontuna bırakmak |
| İkonlar | `lucide-react-native`, **her ikon kendi yolundan** import edilir: `import Menu from 'lucide-react-native/icons/menu'` (sekme çubuğunda native `sf` / `md` ikonları) | `import { Menu } from 'lucide-react-native'` (geliştirmede ~2000 ikonun hepsini bundle'a yükler, açılışı yavaşlatır), panelui ikonları, `@expo/vector-icons`, emoji/karakterle ikon (`☀`, `›`, `⌄`) |
| Kod formatı | Editör (Cursor) formatlayıcı + `npx expo lint` | Prettier vb. ek paket |

**Bağımlılık kuralları**
- Paket kurulumu her zaman `npx expo install <paket>` ile yapılır (npm/yarn add değil).
- Yeni bir pakete ihtiyaç doğarsa: neden gerektiği ve mevcut araçlarla neden çözülemediği açıklanır, onay beklenir.
- `uniwind`, `tailwindcss`, `@expo/ui`, `@react-native-masked-view/masked-view`, `expo-glass-effect`, `expo-linear-gradient`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-svg`, `react-native-worklets` **panelui-native'in bağımlılıklarıdır**; kodda import edilmeseler bile kaldırılmaz.

---

## 2. Klasör yapısı (tür bazlı)

```
src/
├── app/                 Sadece rotalar (Expo Router). İçinde iş mantığı olmaz.
│   ├── _layout.tsx      Kök layout: provider'lar, font yükleme
│   └── (tabs)/          Sekmeler. Her dosya ilgili Screen'i render eder, başka bir şey yapmaz.
├── screens/<Modül>Tab/  Ekranlar: <Ad>Screen.tsx
├── components/
│   ├── ui/              Genel, modülden bağımsız yapı taşları (chip, buton, picker…)
│   ├── cards/ charts/ layout/ settings/ …   Kategoriye göre bileşenler
├── api/                 Kaynak başına bir dosya: istek fonksiyonları + query key'ler + query/mutation hook'ları
├── schemas/             zod şemaları ve onlardan türetilen tipler (kaynak başına bir dosya)
├── stores/              zustand store'ları
├── hooks/               Ortak, API dışı custom hook'lar (useAppTheme, useLocale…)
├── constants/           Sabit listeler ve anahtarlar (diller, dönemler, sipariş durumları…)
├── lib/                 Altyapı: apiClient, queryClient, storage yardımcıları
├── theme/               colors, typography, theme
├── i18n/                i18n kurulumu ve locales/tr.json, locales/en.json
├── utils/               Saf yardımcı fonksiyonlar (formatter vb.)
└── mocks/               GEÇİCİ mock veriler. Backend hazır oldukça silinir.
```

- `src/app/` içine route olmayan dosya konmaz.
- Bir bileşen yalnızca tek bir ekranda kullanılıyorsa bile `src/components/<kategori>/` altına konur; ekran dosyasının içinde uzun alt bileşenler tanımlanmaz.
- Yeni bir üst seviye klasör açmak onay gerektirir.

---

## 3. Veri ve state kuralları

State'in nerede tutulacağı şu sırayla belirlenir:

1. **Sunucudan geliyorsa → React Query.** Liste, detay, dashboard verisi vb. Asla zustand'a veya `useState`'e kopyalanmaz.
2. **Form verisiyse → react-hook-form.**
3. **Tek bir bileşeni ilgilendiriyorsa → `useState`.** (açık/kapalı, seçili sekme…)
4. **Birden çok ekranı ilgilendiren istemci state'iyse → zustand.** (oturum, tema, dil, ortak filtreler…)

### API (`src/api/`)
- Ekranlar ve bileşenler asla doğrudan `fetch` / `apiClient` çağırmaz; yalnızca `src/api/` içindeki hook'ları kullanır.
- Her kaynak dosyası şu yapıdadır:
  ```ts
  // src/api/products.ts
  export const productKeys = {
    all: ['products'] as const,
    list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
    detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  };

  export async function getProducts(filters: ProductFilters) {
    return apiClient.get('/products', { params: filters, schema: productListSchema });
  }

  export function useProducts(filters: ProductFilters) {
    return useQuery({ queryKey: productKeys.list(filters), queryFn: () => getProducts(filters) });
  }
  ```
- Query key'ler elle string olarak yazılmaz, her zaman `xKeys` nesnesinden alınır.
- Sunucu yanıtları `apiClient` içinde zod şemasıyla doğrulanır.
- Mutation sonrası ilgili query'ler `queryClient.invalidateQueries({ queryKey: xKeys.all })` ile yenilenir.
- Backend hazır olmadan önce hook'lar mock veri döndürebilir; ekranlar yine hook üzerinden çalışır, böylece geçişte sadece hook'un içi değişir.
- Her veri kullanan ekran **loading**, **error** ve **boş liste** durumlarını gösterir.
- **Liste kalıbı:** Sunucudan gelen listeler `FlatList` + `useInfiniteQuery` (sayfalama / sonsuz kaydırma) ile yazılır; aşağı çekip yenileme (`refreshing` / `onRefresh`), arama varsa debounce'lu arama ve loading / error / boş durumları her listede bulunur.
- Uygulama **çevrimdışı çalışmaz**. Offline cache / senkronizasyon yazılmaz; bağlantı yoksa çevrilmiş bir "bağlantı yok" mesajı ve tekrar dene seçeneği gösterilir.
- Sunucu adresi koda yazılmaz; `.env` içindeki `EXPO_PUBLIC_API_URL` ile verilir.

### zustand (`src/stores/`)
- Dosya adı `<ad>Store.ts`, hook adı `use<Ad>Store`.
- Bileşenler store'dan seçici ile okur: `useAuthStore((s) => s.user)`. Tüm store'u destructure etmek yasak.
- Kalıcı olması gereken state `persist` middleware ile saklanır; token gibi hassas veri `expo-secure-store` ile.

### Formlar
- Her form `useForm` + `zodResolver(schema)` kullanır. Şema `src/schemas/` içindedir, form tipi `z.infer` ile türetilir.
- Input'lar `Controller` ile bağlanır. Hata mesajları i18n anahtarlarıdır.
- Gönderim, `src/api/` içindeki bir `useMutation` hook'u ile yapılır.

---

## 4. Stil ve tema

- Stiller `StyleSheet.create` ile, bileşen dosyasının altında tanımlanır. Renge bağlı stiller şu kalıpla yazılır:
  ```ts
  const styles = useMemo(() => createStyles(colors), [colors]);
  function createStyles(colors: AppColors) { return StyleSheet.create({ … }); }
  ```
### Renkler
- Renkler **yalnızca** `src/theme/colors.ts` içindeki token'lardan gelir (`colors.text`, `colors.orange`…). Bileşenlerde, layout'larda veya panelui bileşenlerine verilen prop'larda hex, `rgb()` ya da renk adı (`'white'`) yazılmaz.
- Mevcut token'lardan biri ihtiyacı karşılamıyorsa yeni renk **tek başına eklenmez**: ihtiyaç ve önerilen değer proje sahibine sunulur, birlikte karar verilir, sonra hem `lightColors` hem `darkColors`'a eklenir.

### Tipografi
- Metin stilleri `src/theme/typography.ts` içindeki `typography` preset'leri ile verilir (`...typography.body`, `...typography.caption`…). Font ailesi ve boyutu gerekiyorsa yalnızca `FONT_FAMILY` / `FONT_SIZE` / `LINE_HEIGHT` sabitlerinden alınır.
- Sayısal `fontSize` / `lineHeight` değeri veya `fontFamily` string'i elle yazılmaz. `fontWeight` kullanılmaz (Inter ağırlıkları ayrı font dosyalarıdır, kalınlık `FONT_FAMILY` ile seçilir).
- Mevcut preset'ler yetmiyorsa yeni preset, renklerde olduğu gibi birlikte kararlaştırılıp `typography.ts`'e eklenir.

### Boşluk, köşe ve boyutlar
- `padding`, `margin`, `gap` değerleri yalnızca `SPACING`, `borderRadius` değerleri yalnızca `RADIUS`, ikon boyutları yalnızca `ICON_SIZE` sabitlerinden alınır (`src/theme/spacing.ts`). Bileşenlerde bu alanlar için sayı yazılmaz.
- Ekranın yatay kenar boşluğu her ekranda `SPACING.xl`'dir.
- Yeni bir değer gerekiyorsa renklerde olduğu gibi birlikte kararlaştırılıp dosyaya eklenir.

### Tailwind / Uniwind
- `className` ve Tailwind sınıfları kendi kodumuzda **kullanılmaz**. `uniwind` ve `tailwindcss` yalnızca panelui-native'in ihtiyacı için kuruludur ve kaldırılmaz.
- Inline stil yalnızca gerçekten dinamik değerler için (ör. `{ width }`).

---

### Tema (açık / koyu)
- Kullanıcıya açık ve koyu tema seçeneği sunulur; **varsayılan açık temadır** (cihazın sistem temasını otomatik takip etmez).
- Seçim `themeStore`'da tutulur ve kalıcıdır. Bileşenler renkleri `lightColors`/`darkColors`'tan doğrudan değil, `const { colors } = useAppTheme()` ile alır.
- Biçimlendirme için gereken locale `useLocale()` ile alınır; dil seçimi `languageStore` üzerinden yapılır (`i18n.changeLanguage` doğrudan çağrılmaz).
- Her yeni ekran ve bileşen iki temada da kontrol edilir.

## 5. Çoklu dil (i18n)

- Kullanıcının göreceği **hiçbir metin** koda gömülmez: etiketler, butonlar, hata mesajları, `accessibilityLabel`'lar dahil. Hepsi `t('...')` ile.
- Bu kural uygulamanın ürettiği **veri metinleri** için de geçerlidir: durum adları (`Beklemede`, `Kargoda`), birimler, kategori/dönem adları, boş liste ve uyarı mesajları, mock veriler. Kodda yalnızca anahtar tutulur (`status: 'pending'`), görünen metin locale dosyasından gelir (`t('orders.status.pending')`).
- Kullanıcının kendi girdiği veriler (ürün adı, müşteri adı, not…) çevrilmez, olduğu gibi gösterilir.
- Her yeni anahtar **aynı anda** `tr.json` ve `en.json`'a eklenir; iki dosyanın anahtarları her zaman birebir aynıdır.
- Anahtarlar ekran/alan bazlı iç içe yazılır: `dashboard.totalSales`, `filters.today`, `stock.emptyList`.
- Para, sayı ve tarih biçimlendirme yalnızca `src/utils/formatter.ts` fonksiyonlarıyla yapılır; bileşenlerde doğrudan `toLocaleString` yazılmaz.
- Para birimi **yalnızca TL**'dir. Çoklu para birimi desteği yazılmaz; `formatMoney` her zaman TRY biçimlendirir.
- Kod içindeki kimlik değerleri (enum, filtre anahtarı, API parametresi) İngilizce'dir (`'today'`, `'weekly'`); görünen metin i18n'den gelir.

---

## 5.1 Ürün ve oturum modeli

- Uygulama, müşterilere satılan web panelinin mobil sürümüdür. Müşteri, kendisine verilen kullanıcı adı ve şifre ile giriş yapar ve kendi mağazasını (stok, sipariş, rapor) yönetir.
- Rol / yetki sistemi **yoktur**; giriş yapan her kullanıcı kendi mağazasının tüm ekranlarını görür. Rol bazlı gizleme kodu yazılmaz.
- Kayıt (sign up) ekranı yoktur; hesaplar müşteriye verilir.

## 6. TypeScript ve kod stili

- `strict` modu açık kalır. `any`, `@ts-ignore`, `@ts-expect-error` ve gereksiz `as` kullanılmaz.
- API ve form tipleri zod şemalarından `z.infer` ile türetilir; aynı tip elle ikinci kez yazılmaz.
- Importlar `@/` alias'ı ile yazılır (`@/theme/colors`), uzun göreli yollar (`../../`) kullanılmaz.
- Bileşenler: dosya başına bir bileşen, PascalCase dosya adı, `export default function`. Props tipi `<Bileşen>Props` adıyla dosyada tanımlanır.
- Hook'lar `use` ile başlar, camelCase dosya adı (`useDebounce.ts`).
- Butonlar `Pressable` ile yazılır, `accessibilityRole` ve çevrilmiş `accessibilityLabel` içerir. Dokunma alanı en az 44×44.
- Uzun listeler `ScrollView` + `map` ile değil `FlatList` (veya panelui liste bileşeni) ile render edilir.
- `console.log` yalnızca geçici olarak kullanılır, commit'lenmez.
- Kod yorumları Türkçe, kısa ve "neden"i açıklayan şekilde yazılır.

---

## 7. Görev bitmeden önce

```bash
npx tsc --noEmit   # tip hatası olmamalı
npx expo lint      # lint hatası olmamalı
```

Değişiklik iOS ve Android'de (mümkünse) denenir. Yeni metin eklendiyse `tr.json` / `en.json` anahtarlarının eşit olduğu kontrol edilir.

---

## 8. Expo kuralları

### Expo değişti — eğitim verine güvenme

Expo her SDK sürümünde kırıcı değişiklikler yapar. Hatırladığın API'ler büyük ihtimalle yeniden adlandırılmış, taşınmış veya kaldırılmıştır. Bir Expo, EAS veya React Native API'sine dokunan kod yazmadan önce:

1. `package.json` içindeki `expo` paketinin ana sürümünü oku.
2. Eşleşen sürüm dokümanını aç: `https://docs.expo.dev/versions/v<major>.0.0/`
3. Diğer her şey için https://docs.expo.dev/llms.txt adresine bak — tüm Expo dokümanlarının dizini ve yaygın LLM yanılgılarına düzeltmeler içerir. İhtiyacın olan sayfaya oradan git; asla hafızadan cevap verme.

### Komutlar

```bash
npx expo install <paket>  # npm/yarn/pnpm/bun add YERİNE her zaman bu — SDK uyumlu sürümü seçer
npx expo start            # geliştirme sunucusu
npx expo lint             # lint
npx tsc --noEmit          # tip kontrolü
npx expo-doctor           # bağımlılık ve yapılandırma teşhisi
npx expo install --fix    # uyumsuz paket sürümlerini düzelt
```

### Navigasyon

- Tüm navigasyon **Expo Router** ile. Rotalar `src/app/` içindedir; her dosya bir ekrandır, `_layout.tsx` navigator tanımlar. Parantezli klasörler (`(tabs)`) URL'ye eklenmeyen gruplardır.
- `Link`, `router`, `useLocalSearchParams` `expo-router`'dan import edilir.
- Doküman: https://docs.expo.dev/router/introduction.md

### EAS

Derleme, imzalama ve mağazaya gönderme EAS ile yapılır (`eas build`, `eas submit`); OTA güncellemeler `eas update` ile. EAS CLI `npx eas-cli@latest <komut>` olarak çalıştırılır.
Doküman: https://docs.expo.dev/eas/index.md

### Native kurallar

- `ios/` ve `android/` klasörleri yoksa otomatik üretilir (Continuous Native Generation). Elle oluşturulmaz veya düzenlenmez — native davranış `app.json` ve config plugin'leri ile ayarlanır.
- Expo Go yalnızca kendi içindeki native modülleri içerir. Native kodlu bir kütüphane eklendikten sonra development build gerekir: `npx expo run:ios|android` veya `eas build --profile development`.
- Üçüncü parti kütüphaneler yerine önerilen Expo modülleri tercih edilir (yine de Bölüm 1'deki onay kuralı geçerlidir). Doküman: https://docs.expo.dev/versions/latest/index.md
