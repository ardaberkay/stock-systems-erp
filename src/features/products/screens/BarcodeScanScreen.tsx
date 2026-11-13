import Button from '@/components/ui/Button';
import StateMessage from '@/components/ui/StateMessage';
import Text from '@/components/ui/Text';
import { useProducts } from '@/features/products/api/products';
import { PRODUCT_STATUS } from '@/features/products/constants/products';
import {
  useBarcodeScanStore,
  type BarcodeCartAddResult,
} from '@/features/products/stores/barcodeScanStore';
import {
  buildBarcodeIndex,
  normalizeBarcode,
  resolveBarcode,
} from '@/features/products/utils/productList';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import {
  CameraView,
  PermissionStatus,
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
} from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Flashlight from 'lucide-react-native/icons/flashlight';
import FlashlightOff from 'lucide-react-native/icons/flashlight-off';
import X from 'lucide-react-native/icons/x';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, BackHandler, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Yalnızca ürün etiketlerinde kullanılan türler: daha hızlı okur, bakım etiketindeki QR gibi
// başka kodları yanlışlıkla okumaz. EAN-13 panelin ürettiği barkodlardır; etiket yazıcısı
// Code 128 basıyor olabilir.
const BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'];
// Barkod bulunamazsa katalog bu süreden eskiyse bir kez yenilenir (panelden yeni eklenmiş
// olabilir). Arka arkaya bulunamayan okutmalar dakikada en fazla bir istek atar.
const CATALOG_RECHECK_AGE_MS = 60_000;
// Aynı barkod kamerada durdukça tekrar işlenmez (sepete iki kez eklenmesin). Bu süre boyunca
// hiç görülmezse, yani çerçeveden çıkarılıp geri getirilirse yeniden işlenir.
const SAME_BARCODE_COOLDOWN_MS = 1500;
// Arama modunda yeşil çerçeve görünsün, sonra ekran kapansın
const FOUND_CLOSE_DELAY_MS = 400;
// Yeşil / kırmızı çerçeve bu süre sonra turuncuya döner; mesaj yerinde kalır
const TONE_RESET_MS = 1200;
// Bu süre boyunca hiçbir şey okunmazsa ipucu çıkar
const TIP_DELAY_MS = 10_000;
const CORNER_SIZE = SPACING.xxl;
const CORNER_WIDTH = 3;
// Köşe dışa CORNER_WIDTH kadar taşar; pencerenin sivri köşesi yuvarlağın içinde kalsın diye
// yarıçap çizgi kalınlığının ~3,4 katını geçmemeli (3 → en fazla 10). Büyürse uçta açık alan görünür.
const CORNER_RADIUS = RADIUS.sm;
const TORCH_BUTTON_SIZE = MIN_TOUCH_SIZE + SPACING.md;

type FrameTone = 'idle' | 'success' | 'error';

type MissKind = 'notFound' | 'passive' | 'outOfStock' | 'multiple';

type ScanFeedback =
  | { kind: 'checking' }
  | Extract<BarcodeCartAddResult, { kind: 'added' }>
  | { kind: MissKind };

// Barkod okutma ekranı (tam ekran modal). Arama modunda ürünü bulunan barkod açan ekrana
// verilir ve ekran kapanır. Sepet modunda her okutma bedeni sepete ekler, kamera açık kalır.
// Bulunamazsa sebep kameranın üstünde yazılır, tarama sürer.
export default function BarcodeScanScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const request = useBarcodeScanStore((state) => state.request);
  const [permission, requestPermission] = useCameraPermissions();
  const { data: products, dataUpdatedAt, refetch } = useProducts();
  const barcodeIndex = useMemo(() => buildBarcodeIndex(products ?? []), [products]);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [tone, setTone] = useState<FrameTone>('idle');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);
  // Hata sonrası "Tekrar dene" kamerayı baştan kurar
  const [cameraKey, setCameraKey] = useState(0);
  const [showTip, setShowTip] = useState(false);
  // Her okutma ipucu sayacını baştan başlatır
  const [scanCount, setScanCount] = useState(0);
  // Kamera aynı barkodu saniyede birkaç kez bildirir; biri işlenirken gelenler yok sayılır
  const isBusyRef = useRef(false);
  const lastSeenRef = useRef<{ barcode: string; at: number } | null>(null);
  // Sepet modunda ilk eklemeden sonra sepetteki toplam adet; "Tamamla (N)" butonu bunu gösterir,
  // doluysa kapatınca ürün seçme penceresi de kapanır
  const [cartCount, setCartCount] = useState<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCameraOn = Boolean(permission?.granted) && !hasCameraError;

  // Kullanıcı ikona basarak okutmak istedi; izin hiç sorulmadıysa ayrıca butona bastırılmaz
  useEffect(() => {
    if (permission?.status === PermissionStatus.UNDETERMINED) {
      void requestPermission();
    }
  }, [permission?.status, requestPermission]);

  useEffect(() => {
    if (!isCameraOn) {
      return;
    }
    const timer = setTimeout(() => setShowTip(true), TIP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isCameraOn, scanCount]);

  // Ekran kapanırken bekleyen kapanış ve renk dönüşü çalışmasın
  useEffect(() => {
    const closeTimer = closeTimerRef;
    const toneTimer = toneTimerRef;

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
      if (toneTimer.current) {
        clearTimeout(toneTimer.current);
      }
    };
  }, []);

  // Sepete ekleme yapıldıysa sipariş formuna dönülür: eklenenler sepette görünür
  const close = () => {
    if (request?.mode === 'cart' && cartCount !== null) {
      router.dismiss(2);
      return;
    }
    router.back();
  };

  // Android geri hareketi de X gibi davranır
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });

    return () => subscription.remove();
  });

  const showTone = (next: Exclude<FrameTone, 'idle'>) => {
    setTone(next);
    if (toneTimerRef.current) {
      clearTimeout(toneTimerRef.current);
    }
    toneTimerRef.current = setTimeout(() => setTone('idle'), TONE_RESET_MS);
  };

  const showMiss = (kind: MissKind) => {
    setFeedback({ kind });
    showTone('error');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleScanned = async ({ data }: BarcodeScanningResult) => {
    const barcode = normalizeBarcode(data);
    const now = Date.now();
    const lastSeen = lastSeenRef.current;
    const isRepeat =
      lastSeen?.barcode === barcode && now - lastSeen.at < SAME_BARCODE_COOLDOWN_MS;
    // Kamerada durduğu sürece "son görülme" ilerler; çıkarılınca süre dolar
    lastSeenRef.current = { barcode, at: now };

    if (isBusyRef.current || !barcode || isRepeat) {
      return;
    }
    isBusyRef.current = true;
    setShowTip(false);
    setScanCount((count) => count + 1);

    let resolution = resolveBarcode(products ?? [], barcodeIndex, barcode);

    if (resolution.kind === 'notFound' && Date.now() - dataUpdatedAt > CATALOG_RECHECK_AGE_MS) {
      setFeedback({ kind: 'checking' });
      const { data: fresh = [] } = await refetch();
      resolution = resolveBarcode(fresh, buildBarcodeIndex(fresh), barcode);
    }

    if (request?.mode === 'search') {
      if (resolution.kind === 'notFound') {
        showMiss('notFound');
        isBusyRef.current = false;
        return;
      }
      setTone('success');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeTimerRef.current = setTimeout(() => {
        request.onScanned(barcode);
        router.back();
      }, FOUND_CLOSE_DELAY_MS);
      return;
    }

    if (request?.mode === 'cart') {
      if (resolution.kind !== 'match') {
        showMiss(resolution.kind);
      } else if (resolution.product.status !== PRODUCT_STATUS.active) {
        // Pasif ürün panelde satışa kapalıdır
        showMiss('passive');
      } else {
        const result = request.onAdd(resolution.product, resolution.variant);

        if (result.kind === 'outOfStock') {
          showMiss('outOfStock');
        } else {
          setCartCount(result.cartCount);
          setFeedback(result);
          showTone('success');
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
    isBusyRef.current = false;
  };

  const retryCamera = () => {
    setHasCameraError(false);
    setCameraKey((key) => key + 1);
  };

  // Kamera açık değilken (izin, hata) ekran temanın renklerini kullanır
  if (!isCameraOn) {
    const canAsk = permission?.canAskAgain ?? true;

    return (
      <View style={[styles.screen, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {t('stock.barcodeScan.title')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={close}
            style={styles.closeButton}
          >
            <X size={ICON_SIZE.lg} color={colors.text} />
          </Pressable>
        </View>

        {!permission ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : hasCameraError ? (
          <StateMessage message={t('stock.barcodeScan.cameraError')} onRetry={retryCamera} />
        ) : (
          // "Bir daha sorma" denildiyse uygulama izni tekrar soramaz; yalnızca ayarlardan açılır
          <View style={styles.state}>
            <Text style={styles.stateTitle}>{t('stock.barcodeScan.permissionTitle')}</Text>
            <Text style={styles.stateMessage}>
              {t(canAsk ? 'stock.barcodeScan.permissionMessage' : 'stock.barcodeScan.permissionDenied')}
            </Text>
            <Button
              label={t(canAsk ? 'stock.barcodeScan.allow' : 'stock.barcodeScan.openSettings')}
              onPress={() => (canAsk ? void requestPermission() : void Linking.openSettings())}
            />
          </View>
        )}
      </View>
    );
  }

  const frameColor =
    tone === 'success' ? colors.success : tone === 'error' ? colors.error : colors.orange;
  // Çerçeve ne yapılacağını zaten gösteriyor; okuma olmazsa ipucu çıkar. İpucu son eklenen
  // ürünün yerine geçmez, yalnızca boşken veya bir hatadan sonra görünür.
  const isTipVisible = showTip && feedback?.kind !== 'added' && feedback?.kind !== 'checking';
  const messageLines = isTipVisible
    ? [t('stock.barcodeScan.tip')]
    : !feedback
      ? []
      : feedback.kind === 'added'
        ? [
            t('stock.barcodeScan.added', {
              product: feedback.productName,
              size: feedback.sizeName,
              count: formatNumber(feedback.sizeQuantity, locale),
            }),
            t('stock.barcodeScan.cartSummary', {
              count: formatNumber(feedback.cartCount, locale),
              total: formatMoney(feedback.cartTotal, locale),
            }),
          ]
        : [t(`stock.barcodeScan.${feedback.kind}`)];
  const TorchIcon = isTorchOn ? Flashlight : FlashlightOff;

  // Kamera tüm ekranı kaplar (tablette de); çerçevenin dışı karartılır, yazılar karartmanın
  // üstünde beyazdır. Görüntü temadan bağımsız olduğu için bu kısım iki temada da aynıdır.
  return (
    <View style={styles.cameraScreen}>
      {/* Arkası her zaman koyu kamera görüntüsü; kapanınca kök layout'taki ayar geri gelir */}
      <StatusBar style="light" />
      <CameraView
        key={cameraKey}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={isTorchOn}
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={(result) => void handleScanned(result)}
        onMountError={() => setHasCameraError(true)}
      />

      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.shade, styles.topShade, { paddingTop: insets.top + SPACING.sm }]}>
          {/* Kullanıcı okutmak için geldi; başlık yerine yalnızca kapat butonu */}
          <View style={styles.cameraHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={close}
              style={styles.closeButton}
            >
              <X size={ICON_SIZE.lg} color={colors.imageBadge} />
            </Pressable>
          </View>
        </View>

        <View style={styles.middleRow}>
          <View style={styles.shade} />
          {/* Kullanıcıya barkodu nereye getireceğini gösterir; köşelerin rengi sonucu söyler */}
          <View style={styles.window} pointerEvents="none">
            <View style={[styles.corner, styles.topLeft, { borderColor: frameColor }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: frameColor }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: frameColor }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: frameColor }]} />
          </View>
          <View style={styles.shade} />
        </View>

        <View
          style={[styles.shade, styles.bottomShade, { paddingBottom: insets.bottom + SPACING.xl }]}
        >
          {/* Mesaj değişince alttaki fener butonu yer değiştirmesin */}
          <View style={styles.messageBox} accessibilityLiveRegion="polite">
            {messageLines.map((line, index) => (
              <Text key={line} style={index === 0 ? styles.message : styles.messageDetail}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.controls}>
            {/* Depo gibi karanlık yerlerde etiket okunabilsin */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(isTorchOn ? 'stock.barcodeScan.torchOff' : 'stock.barcodeScan.torchOn')}
              accessibilityState={{ selected: isTorchOn }}
              onPress={() => setIsTorchOn((current) => !current)}
              style={styles.torchButton}
            >
              <TorchIcon size={ICON_SIZE.lg} color={isTorchOn ? colors.orange : colors.imageBadge} />
            </Pressable>
            {/* Başparmağın altında; eklenenlerin sepette kaldığını açıkça söyler (X ile aynı yere döner) */}
            {cartCount !== null ? (
              <Button
                label={t('stock.barcodeScan.finish')}
                onPress={close}
                style={styles.finishButton}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      ...SCREEN_CONTENT,
      flex: 1,
      gap: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      backgroundColor: colors.background,
    },
    cameraScreen: {
      flex: 1,
      backgroundColor: colors.cameraOverlay,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    title: {
      ...typography.h3,
      flex: 1,
      color: colors.text,
    },
    cameraHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    closeButton: {
      width: MIN_TOUCH_SIZE,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shade: {
      flex: 1,
      backgroundColor: colors.cameraOverlay,
    },
    topShade: {
      paddingHorizontal: SPACING.xl,
    },
    // Dışa taşan köşeler sonra çizilen sağ ve alt karartmanın altında kalmasın diye üstte
    middleRow: {
      flexDirection: 'row',
      zIndex: 1,
    },
    // Barkod yatay ve geniş olduğu için pencere de öyle. Okuma pencereyle sınırlı değildir,
    // kamera tüm görüntüde okur; pencere kullanıcıya nereye tutacağını gösterir.
    window: {
      width: '90%',
      aspectRatio: 1.8,
      zIndex: 1,
    },
    // Köşeler pencerenin kenarına oturur, çizgi kalınlığı kadar dışa taşar: karartmanın keskin
    // köşesi yuvarlak köşenin altında kalır, arkadan açık alan görünmez
    corner: {
      position: 'absolute',
      width: CORNER_SIZE,
      height: CORNER_SIZE,
    },
    topLeft: {
      top: -CORNER_WIDTH,
      left: -CORNER_WIDTH,
      borderTopWidth: CORNER_WIDTH,
      borderLeftWidth: CORNER_WIDTH,
      borderTopLeftRadius: CORNER_RADIUS,
    },
    topRight: {
      top: -CORNER_WIDTH,
      right: -CORNER_WIDTH,
      borderTopWidth: CORNER_WIDTH,
      borderRightWidth: CORNER_WIDTH,
      borderTopRightRadius: CORNER_RADIUS,
    },
    bottomLeft: {
      bottom: -CORNER_WIDTH,
      left: -CORNER_WIDTH,
      borderBottomWidth: CORNER_WIDTH,
      borderLeftWidth: CORNER_WIDTH,
      borderBottomLeftRadius: CORNER_RADIUS,
    },
    bottomRight: {
      bottom: -CORNER_WIDTH,
      right: -CORNER_WIDTH,
      borderBottomWidth: CORNER_WIDTH,
      borderRightWidth: CORNER_WIDTH,
      borderBottomRightRadius: CORNER_RADIUS,
    },
    bottomShade: {
      alignItems: 'center',
      gap: SPACING.xl,
      paddingTop: SPACING.xl,
      paddingHorizontal: SPACING.xl,
    },
    // İki satır (son eklenen ve sepet özeti) için yer hep ayrılır
    messageBox: {
      minHeight: typography.bodySmall.lineHeight * 2 + SPACING.xxs,
      gap: SPACING.xxs,
      alignItems: 'center',
    },
    message: {
      ...typography.bodySmall,
      color: colors.imageBadge,
      textAlign: 'center',
    },
    messageDetail: {
      ...typography.caption,
      color: colors.imageBadge,
      textAlign: 'center',
    },
    controls: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.md,
    },
    finishButton: {
      flex: 1,
    },
    torchButton: {
      width: TORCH_BUTTON_SIZE,
      height: TORCH_BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.imageBadge,
    },
    state: {
      flex: 1,
      gap: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stateTitle: {
      ...typography.h3,
      color: colors.text,
      textAlign: 'center',
    },
    stateMessage: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
