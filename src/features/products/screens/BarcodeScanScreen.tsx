import Button from '@/components/ui/Button';
import StateMessage from '@/components/ui/StateMessage';
import Text from '@/components/ui/Text';
import { useProducts } from '@/features/products/api/products';
import { useBarcodeScanStore } from '@/features/products/stores/barcodeScanStore';
import {
  buildBarcodeIndex,
  getBarcodeScanOutcome,
  normalizeBarcode,
  type BarcodeScanOutcome,
} from '@/features/products/utils/productList';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
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
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Yalnızca ürün etiketlerinde kullanılan türler: daha hızlı okur, bakım etiketindeki QR gibi
// başka kodları yanlışlıkla okumaz. EAN-13 panelin ürettiği barkodlardır; etiket yazıcısı
// Code 128 basıyor olabilir.
const BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'];
// Barkod bulunamazsa katalog bu süreden eskiyse bir kez yenilenir (panelden yeni eklenmiş
// olabilir). Arka arkaya bulunamayan okutmalar dakikada en fazla bir istek atar.
const CATALOG_RECHECK_AGE_MS = 60_000;
// Yeşil çerçeve görünsün, sonra ekran kapansın
const FOUND_CLOSE_DELAY_MS = 400;
// Bu süre boyunca hiçbir şey okunmazsa ipucu çıkar
const TIP_DELAY_MS = 10_000;
const CORNER_SIZE = SPACING.xxl;
const CORNER_WIDTH = 3;
// Köşe dışa CORNER_WIDTH kadar taşar; pencerenin sivri köşesi yuvarlağın içinde kalsın diye
// yarıçap çizgi kalınlığının ~3,4 katını geçmemeli (3 → en fazla 10). Büyürse uçta açık alan görünür.
const CORNER_RADIUS = RADIUS.sm;
const TORCH_BUTTON_SIZE = MIN_TOUCH_SIZE + SPACING.md;

type ScanStatus = 'scanning' | 'checking' | BarcodeScanOutcome;

// Barkod okutma ekranı (tam ekran modal). Ürünü bulunan barkod açan ekrana verilir ve ekran
// kapanır; bulunamazsa sebep kameranın üstünde yazılır, tarama sürer.
export default function BarcodeScanScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const request = useBarcodeScanStore((state) => state.request);
  const [permission, requestPermission] = useCameraPermissions();
  const { data: products, dataUpdatedAt, refetch } = useProducts();
  const barcodeIndex = useMemo(() => buildBarcodeIndex(products ?? []), [products]);
  const [status, setStatus] = useState<ScanStatus>('scanning');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);
  // Hata sonrası "Tekrar dene" kamerayı baştan kurar
  const [cameraKey, setCameraKey] = useState(0);
  const [showTip, setShowTip] = useState(false);
  // Her okutma ipucu sayacını baştan başlatır
  const [scanCount, setScanCount] = useState(0);
  // Barkod görüş alanında durdukça kamera onu saniyede birkaç kez bildirir. Biri işlenirken
  // gelenler yok sayılır; yoksa ekran birden çok kez kapanır, arkasındaki sayfa da kapanabilir.
  const isBusyRef = useRef(false);
  // Bulunamayan barkod kamerada durdukça mesaj tekrar tekrar titreşmesin
  const lastMissRef = useRef<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Kullanıcı yeşil çerçeve sırasında kapatırsa bekleyen kapanış çalışmasın
  useEffect(() => {
    const closeTimer = closeTimerRef;

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const handleScanned = async ({ data }: BarcodeScanningResult) => {
    const barcode = normalizeBarcode(data);

    if (isBusyRef.current || !barcode || barcode === lastMissRef.current) {
      return;
    }
    isBusyRef.current = true;
    setShowTip(false);
    setScanCount((count) => count + 1);

    const activeOnly = request?.activeOnly ?? false;
    let outcome = getBarcodeScanOutcome(products ?? [], barcodeIndex, barcode, activeOnly);

    if (outcome === 'notFound' && Date.now() - dataUpdatedAt > CATALOG_RECHECK_AGE_MS) {
      setStatus('checking');
      const { data: fresh = [] } = await refetch();
      outcome = getBarcodeScanOutcome(fresh, buildBarcodeIndex(fresh), barcode, activeOnly);
    }

    if (outcome === 'found') {
      setStatus('found');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeTimerRef.current = setTimeout(() => {
        request?.onScanned(barcode);
        router.back();
      }, FOUND_CLOSE_DELAY_MS);
      return;
    }

    lastMissRef.current = barcode;
    setStatus(outcome);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
            onPress={() => router.back()}
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
    status === 'found'
      ? colors.success
      : status === 'notFound' || status === 'passive'
        ? colors.error
        : colors.orange;
  const message =
    status === 'checking'
      ? t('stock.barcodeScan.checking')
      : status === 'notFound'
        ? t('stock.barcodeScan.notFound')
        : status === 'passive'
          ? t('stock.barcodeScan.passive')
          : // Çerçeve ne yapılacağını zaten gösteriyor; yazı yalnızca okunmazsa ipucu olarak çıkar
            showTip
            ? t('stock.barcodeScan.tip')
            : '';
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
              onPress={() => router.back()}
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
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {message}
          </Text>
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
    // Mesaj değişince alttaki fener butonu yer değiştirmesin
    message: {
      ...typography.bodySmall,
      minHeight: typography.bodySmall.lineHeight * 2,
      color: colors.imageBadge,
      textAlign: 'center',
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
