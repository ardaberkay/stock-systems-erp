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
| UI bileşenleri | Kendi bileşenlerimiz: `src/components/ui` | panelui-native bileşenleri (grafik, takvim, raporlardaki `Kpi` ve `Leaderboard` hariç), başka UI kütüphanesi |
| Metin ve giriş alanı | `@/components/ui/Text` ve `@/components/ui/TextInput` (yazı büyütmeyi `MAX_FONT_SCALE` ile sınırlar) | `react-native`'den doğrudan `Text` / `TextInput` import etmek |
| Tarih (aralığı) seçici | `panelui-native` `Calendar` (yalnızca `src/components/ui/DateRangePicker.tsx` sarmalayıcısı üzerinden; gün bazında seçilir, saat seçtirilmez) | Başka picker kütüphanesi |
| Stil | `StyleSheet.create` + `src/theme` token'ları | `className` / Tailwind sınıfları, styled-components |
| Grafik | `panelui-native` grafikleri (`LineChart` vb.), **her bileşen kendi yolundan** import edilir: `import { LineChart } from 'panelui-native/components/line-chart'`, provider `panelui-native/provider` | `import { LineChart } from 'panelui-native'` (141 bileşenin hepsini bundle'a yükler: ölçümde +1,3 MB, açılışta ~240 gereksiz modül), başka chart kütüphanesi |
| Sekme çubuğu | `expo-router/native-tabs` (iOS 26+ Liquid Glass varsayılan gelir) | JS tabanlı tab bar |
| Yan menü (drawer) | `expo-router/drawer` — platform varsayılanları: iOS `slide` (ekranı iter), Android `front` (üstüne biner). Ayarlar drawer içindedir | `@react-navigation/drawer`'ı doğrudan kurmak, panelui drawer |
| Kalıcı tercihler (tema, dil vb.) | `@react-native-async-storage/async-storage` (zustand `persist` ile) | Hassas veriyi AsyncStorage'da tutmak |
| Lint | `eslint` + `eslint-config-expo` (`npx expo lint`) | Başka lint ayarları |
| Hassas veri (token vb.) | `expo-secure-store` | AsyncStorage'da token tutmak |
| Görseller | `expo-image` | React Native `Image` |
| Kamera / barkod okutma | `expo-camera` `CameraView` (yalnızca `features/products/screens/BarcodeScanScreen.tsx` üzerinden; okutma isteği `useOpenBarcodeScanner` ile açılır) | Başka kamera veya barkod kütüphanesi, `launchScanner` (Android'de Google Play Hizmetleri gerektirir) |
| Titreşim (dokunsal geri bildirim) | `expo-haptics` | React Native `Vibration` API |
| Animasyon | `react-native-reanimated` | `Animated` API |
| Fontlar | `@expo-google-fonts/inter` (`FONT_FAMILY` üzerinden) | Sistem fontuna bırakmak |
| İkonlar | `lucide-react-native`, **her ikon kendi yolundan** import edilir: `import Menu from 'lucide-react-native/icons/menu'` (sekme çubuğunda native `sf` / `md` ikonları) | `import { Menu } from 'lucide-react-native'` (geliştirmede ~2000 ikonun hepsini bundle'a yükler, açılışı yavaşlatır), panelui ikonları, `@expo/vector-icons`, emoji/karakterle ikon (`☀`, `›`, `⌄`) |
| Kod formatı | Editör (Cursor) formatlayıcı + `npx expo lint` | Prettier vb. ek paket |

**Bağımlılık kuralları**
- Paket kurulumu her zaman `npx expo install <paket>` ile yapılır (npm/yarn add değil).
- Yeni bir pakete ihtiyaç doğarsa: neden gerektiği ve mevcut araçlarla neden çözülemediği açıklanır, onay beklenir.
- `uniwind`, `tailwindcss`, `@expo/ui`, `@react-native-masked-view/masked-view`, `expo-glass-effect`, `expo-linear-gradient`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-svg`, `react-native-worklets` **panelui-native'in bağımlılıklarıdır**; kodda import edilmeseler bile kaldırılmaz.

---

## 2. Klasör yapısı (modül bazlı)

```
src/
├── app/                 Sadece rotalar (Expo Router). İçinde iş mantığı olmaz.
│   ├── _layout.tsx      Kök layout: provider'lar, font yükleme
│   └── (drawer)/(tabs)/ Sekmeler. Her route dosyası ilgili Screen'i render eder, başka bir şey yapmaz.
├── features/            İş modülleri. Bir modüle ait her şey kendi klasöründedir.
│   ├── orders/          api/ schemas/ constants/ utils/ hooks/ components/ screens/ + store
│   ├── products/        aynı düzen
│   ├── reports/         aynı düzen
│   ├── dashboard/       aynı düzen
│   ├── period/          Dönem seçimi (dashboard, siparişler ve raporların ortak kullandığı)
│   ├── picker/          Seçim sheet'leri ve onları açan form alanları
│   └── settings/
├── components/
│   ├── ui/              Genel, modülden bağımsız yapı taşları (Text, TextInput, buton, chip, skeleton…)
│   │   ├── form/        Genel form alanları (TextField, MoneyField, SwitchRow…)
│   │   └── charts/      Grafiklerin görsel parçaları (eksen, değer göstergesi)
│   └── layout/          Uygulama iskeleti (drawer içeriği)
├── hooks/               Genel hook'lar (useAppTheme, useLocale, useDebounce, useCurrentTime, useFocusSubscribed…)
├── stores/              Genel zustand store'ları (tema, dil, saat…)
├── constants/           Genel sabitler (diller)
├── lib/                 Altyapı: apiClient, queryClient, cachePolicy, env
├── theme/               colors, typography, spacing, theme
├── i18n/                i18n kurulumu ve locales/tr.json, locales/en.json
└── utils/               Genel saf yardımcı fonksiyonlar (formatter, dateKey)
```

**Bir dosya nereye konur?**
1. Yalnızca bir modül kullanıyorsa → o modülün klasörüne (`features/<modül>/…`). Yeni kod her zaman önce buraya yazılır.
2. Hiçbir iş kavramı bilmiyorsa (buton, switch, metin alanı) → `components/ui/`, `hooks/`, `utils/`.
3. İş kavramı biliyor ama birden çok modül kullanıyorsa → kendi modül klasörü (ör. `features/period/`).
4. Başka bir modül de ihtiyaç duyarsa o gün taşınır; önceden tahmin edilmez.

**Modül içi düzen**
- Alt klasör (`hooks/`, `stores/`, `utils/`…) yalnızca aynı türden birkaç dosya olunca açılır; tek dosya modül kökünde durur (ör. `features/orders/orderFilterStore.ts`).
- Ekranlar `features/<modül>/screens/<Ad>Screen.tsx`; tek ekranlı modülde doğrudan modül kökünde.
- Modüller birbirinden import edebilir (ör. siparişler ürün API'sini kullanır). Dosyalar arasında döngüsel import olmamalıdır (A → B → A); Metro'da yükleme sırasında `undefined` hatalarına yol açar.
- Bir parça birçok modülde kullanılmaya başladıysa ve hiçbir iş kavramı bilmiyorsa ortak klasöre taşınır.
- `components/ui` ve diğer ortak klasörler `features/` içinden import etmez.

**Native sheet'ler**
- Seçim pencereleri (dönem, filtre, picker) alttan açılan native sheet'tir ve her biri `src/app/` altında bir route'tur; seçenekleri `src/app/_layout.tsx`'teki `fitToContentSheetOptions` ile verilir.
- Route'lar arasında fonksiyon veya liste parametre olarak taşınmaz. Sheet'e giden istek ve "seçilince ne olacak" bilgisi bir store üzerinden taşınır (bkz. `features/picker/pickerStore.ts`); form değeri formda kalır.
- Aynı sheet'i birden çok ekran kullanıyorsa ekran başına ayrı route açılmaz; tek route parametreyle ayrılır (ör. `period/[scope]`, bkz. `features/period/usePeriodScope.ts`).

**Genel**
- `src/app/` içine route olmayan dosya konmaz.
- Ekran dosyasının içinde uzun alt bileşenler tanımlanmaz; bileşenler modülün `components/` klasörüne konur.
- Yeni bir üst seviye klasör veya yeni bir modül açmak onay gerektirir.

---

## 3. Veri ve state kuralları

State'in nerede tutulacağı şu sırayla belirlenir:

1. **Sunucudan geliyorsa → React Query.** Liste, detay, dashboard verisi vb. Asla zustand'a veya `useState`'e kopyalanmaz.
2. **Form verisiyse → react-hook-form.**
3. **Tek bir bileşeni ilgilendiriyorsa → `useState`.** (açık/kapalı, seçili sekme…)
4. **Birden çok ekranı ilgilendiren istemci state'iyse → zustand.** (oturum, tema, dil, ortak filtreler…)

### API (`features/<modül>/api/`)
- Ekranlar ve bileşenler asla doğrudan `fetch` / `apiClient` çağırmaz; yalnızca modüllerin `api/` klasöründeki hook'ları kullanır.
- Her kaynak dosyası şu yapıdadır (ButikSistem'de tüm çağrılar `POST`'tur; parametreler `arguments` ile gider):
  ```ts
  // src/features/products/api/products.ts
  export const productKeys = {
    all: ['products'] as const,
    list: () => [...productKeys.all, 'list'] as const,
    byIds: (ids: number[]) => [...productKeys.all, 'byIds', ids] as const,
  };

  export async function getProductsByIds(ids: number[], signal?: AbortSignal) {
    const { data } = await apiClient.post('product/get', {
      schema: productListSchema,
      arguments: { ids },
      signal,
    });
    return data;
  }

  export function useProductsByIds(ids: number[]) {
    const queryKey = productKeys.byIds(ids);
    const subscribed = useFocusSubscribed(queryKey);

    return useQuery({
      queryKey,
      queryFn: ({ signal }) => getProductsByIds(ids, signal),
      ...CACHE.products,
      subscribed,
    });
  }
  ```
- Query key'ler elle string olarak yazılmaz, her zaman `xKeys` nesnesinden alınır.
- Sunucu yanıtları `apiClient` içinde zod şemasıyla doğrulanır. `queryFn`'e gelen `signal` isteğe verilir; ekran kapanınca sıradaki istek gönderilmez.
- **Rate limit:** Sunucu hesap başına saniyede yaklaşık 1 istek kabul eder (test edildi). `apiClient` tüm istekleri tek sırada ~1,25 sn arayla gönderir; paralel istek hız kazandırmaz. Yeni bir ekran verisi önce eldeki önbellekten türetilmeye çalışılır (ör. son 7 günün siparişlerinden dönem süzmek, katalogdan ürün bulmak), ek istek son çaredir.
- Mutation sonrası ilgili query'ler `queryClient.invalidateQueries({ queryKey: xKeys.all })` ile yenilenir.
- Her veri kullanan ekran **loading**, **error** ve **boş liste** durumlarını gösterir. Yenileme göstergesi (`RefreshControl`) yalnızca kullanıcı aşağı çekince döner; arkadaki sessiz yenilemeye (`isRefetching`) bağlanmaz.
- **Liste kalıbı:** Sunucudan gelen listeler `FlatList` ile yazılır; aşağı çekip yenileme (`refreshing` / `onRefresh`), arama varsa debounce'lu arama ve loading / error / boş durumları her listede bulunur. API sayfalama destekliyorsa `useInfiniteQuery` kullanılır. Şu an siparişler (seçili dönem tek istekte gelir) ve ürünler (tüm katalog tek istekte gelir) sayfalama yapmaz; arama ve filtre yüklü veride çalışır.
- **Önbellek:** Süreler yalnızca `src/lib/cachePolicy.ts` içindeki `CACHE`'ten alınır (`...CACHE.orders`); sorgularda sayı yazılmaz. Sık değişen veri (siparişler, katalog) kısa `staleTime` ile, neredeyse sabit listeler (kargo, şehir, ödeme türü) uzun süreyle tutulur. Açık bırakılıp izlenen ekranlar (Siparişler, Dashboard) görünürken `ORDER_AUTO_REFRESH_MS` aralığıyla da yenilenir; başka ekrana otomatik yenileme eklenmez.
- **Odak:** Sekme ve ekran verisi `subscribed: useFocusSubscribed(queryKey)` ile dinlenir: ekran odaktayken veya elinde hiç veri yokken. Böylece açılışta tüm sekmeler arkada yüklenir, sonra arka plandaki sekmeler istek atmaz; ekran odağa gelince veri eskidiyse arkada yenilenir. Ekrandan bağımsız sürmesi gereken takipler (ör. ürün ekleme işi) bu kurala girmez.
- Uygulama **çevrimdışı çalışmaz**. Offline cache / senkronizasyon yazılmaz; bağlantı yoksa çevrilmiş bir "bağlantı yok" mesajı ve tekrar dene seçeneği gösterilir.
- Sunucu adresi koda yazılmaz; `.env` içindeki `EXPO_PUBLIC_API_URL` ile verilir.

### zustand (genel: `src/stores/`, modüle ait: `features/<modül>/`)
- Dosya adı `<ad>Store.ts`, hook adı `use<Ad>Store`.
- Bileşenler store'dan seçici ile okur: `useAuthStore((s) => s.user)`. Tüm store'u destructure etmek yasak.
- Kalıcı olması gereken state `persist` middleware ile saklanır; token gibi hassas veri `expo-secure-store` ile.

### Formlar
- Her form `useForm` + `zodResolver(schema)` kullanır. Şema modülün `schemas/` klasöründedir, form tipi `z.infer` ile türetilir.
- Input'lar `Controller` ile bağlanır. Hata mesajları i18n anahtarlarıdır.
- Gönderim, modülün `api/` klasöründeki bir `useMutation` hook'u ile yapılır.

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
- `TextInput` stiline preset yayılmaz (`...typography.body` değil); yalnızca `fontFamily` ve `fontSize` alınır. Preset'teki `lineHeight` yazarken metni aşağı kaydırır ve g, y gibi harflerin alt kısmını keser.
- **Yazı büyütme:** Telefonun yazı boyutu ayarı metinleri en fazla `MAX_FONT_SCALE` (1,3) kat büyütür; bu sınır `components/ui/Text` ve `TextInput` içindedir. Metin içeren kutulara sabit `height` verilmez, `minHeight` verilir; yazı büyüyünce kutu uzar, metin kesilmez. Yeni ekranlar en büyük yazı ayarıyla da kontrol edilir.

### Boşluk, köşe ve boyutlar
- `padding`, `margin`, `gap` değerleri yalnızca `SPACING`, `borderRadius` değerleri yalnızca `RADIUS`, ikon boyutları yalnızca `ICON_SIZE` sabitlerinden alınır (`src/theme/spacing.ts`). Bileşenlerde bu alanlar için sayı yazılmaz.
- Ekranın yatay kenar boşluğu her ekranda `SPACING.xl`'dir.
- Yeni bir değer gerekiyorsa renklerde olduğu gibi birlikte kararlaştırılıp dosyaya eklenir.

### Ekran boyutları (telefon ve dikey tablet)
- Uygulama yalnızca dikey çalışır; iPad dahil (`app.json`: `supportsTablet`, `requireFullScreen`, iPad yönleri). Tablete özel düzen yoktur.
- Her ekranın kök stiline `...SCREEN_CONTENT` yayılır: tablette içerik `CONTENT_MAX_WIDTH` genişliğinde ortalanır, telefonda etkisi yoktur.
- Genişlikler sabit sayıyla verilmez; flex ve yüzde kullanılır. En dar telefon (360dp) ve dikey tablette kontrol edilir.

### Tailwind / Uniwind
- `className` ve Tailwind sınıfları kendi kodumuzda **kullanılmaz**. `uniwind` ve `tailwindcss` yalnızca panelui-native'in ihtiyacı için kuruludur ve kaldırılmaz.
- Inline stil yalnızca gerçekten dinamik değerler için (ör. `{ width }`).

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
- Bileşenler: dosya başına bir bileşen, PascalCase dosya adı, `export default function`. Props tipi `<Bileşen>Props` adıyla dosyada tanımlanır. İstisna: yalnızca o dosyada kullanılan birkaç satırlık yardımcı bileşen (ör. route parametresi doğrulandıktan sonra asıl içeriği çizen `…Content`) aynı dosyada durabilir.
- Hook'lar `use` ile başlar, camelCase dosya adı (`useDebounce.ts`).
- Butonlar `Pressable` ile yazılır, `accessibilityRole` ve çevrilmiş `accessibilityLabel` içerir. Dokunma alanı en az 44×44.
- Uzun listeler `ScrollView` + `map` ile değil `FlatList` ile render edilir.
- React Compiler açıktır (`app.json` → `experiments.reactCompiler`) ve bileşenleri büyük ölçüde kendisi memoize eder; yine de aşağıdaki kural geçerlidir.
- `useMemo`, `useCallback` ve `React.memo` yalnızca gerçek bir kazanç varsa kullanılır; yeri varsa eklenir, kazanç yoksa kaldırılır. Her yere otomatik eklenmez:
  - **Kullanılır:** liste/kart bileşenleri (`memo`), bu bileşenlere giden fonksiyonlar ve `renderItem` (`useCallback`), büyük veri üzerindeki hesaplar ve grafik verisi (`useMemo`).
  - **Kullanılmaz:** `memo`'suz bileşene giden fonksiyonlar, birkaç elemanlık küçük hesaplar.
  - Bölüm 4'teki `useMemo(() => createStyles(colors), [colors])` kalıbı bu kuralın dışındadır, aynen uygulanır.
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
- Typed routes açıktır: yeni route eklenince veya silinince route tipleri Metro bir kez yeniden başlatılınca güncellenir (`npx expo start`); o zamana kadar `tsc` yeni route'u tanımaz.
- Doküman: https://docs.expo.dev/router/introduction.md

### EAS

Derleme, imzalama ve mağazaya gönderme EAS ile yapılır (`eas build`, `eas submit`); OTA güncellemeler `eas update` ile. EAS CLI `npx eas-cli@latest <komut>` olarak çalıştırılır.
Doküman: https://docs.expo.dev/eas/index.md

### Native kurallar

- `ios/` ve `android/` klasörleri yoksa otomatik üretilir (Continuous Native Generation). Elle oluşturulmaz veya düzenlenmez — native davranış `app.json` ve config plugin'leri ile ayarlanır.
- Expo Go yalnızca kendi içindeki native modülleri içerir. Native kodlu bir kütüphane eklendikten sonra development build gerekir: `npx expo run:ios|android` veya `eas build --profile development`.
- Üçüncü parti kütüphaneler yerine önerilen Expo modülleri tercih edilir (yine de Bölüm 1'deki onay kuralı geçerlidir). Doküman: https://docs.expo.dev/versions/latest/index.md
