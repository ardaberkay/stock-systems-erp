import { useHapticsStore } from '@/stores/hapticsStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Uygulamanın titreşim standardı (AGENTS.md → Titreşim). Ekranlar expo-haptics'i doğrudan
// çağırmaz, buradan anlamına göre çağırır; aynı olay her yerde aynı hissi verir.
// Kural: pencere/sayfa açan dokunuşta titreşim yok; değer değiştirende seçim tıkı; sunucuya
// kaydedenin sonunda başarı/hata; riskli onayda ve hatalı formda uyarı.
//
// Android'de Vibrator yerine sistemin kendi dokunuşları kullanılır: iOS'a benzer, izin istemez
// ve telefonun titreşim ayarına uyar (expo-haptics önerisi).

type HapticKind = 'selection' | 'scrub' | 'longPress' | 'success' | 'warning' | 'error';

const ANDROID: Record<HapticKind, Haptics.AndroidHaptics> = {
  selection: Haptics.AndroidHaptics.Segment_Tick,
  scrub: Haptics.AndroidHaptics.Segment_Frequent_Tick,
  longPress: Haptics.AndroidHaptics.Long_Press,
  success: Haptics.AndroidHaptics.Confirm,
  warning: Haptics.AndroidHaptics.Context_Click,
  error: Haptics.AndroidHaptics.Reject,
};

function playIos(kind: HapticKind) {
  switch (kind) {
    case 'selection':
    case 'scrub':
      return Haptics.selectionAsync();
    case 'longPress':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'warning':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    case 'error':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

function play(kind: HapticKind) {
  // Ayar kapalıysa hiçbir titreşim çalmaz (barkod dahil)
  if (!useHapticsStore.getState().enabled) {
    return;
  }

  const result =
    Platform.OS === 'android' ? Haptics.performAndroidHapticsAsync(ANDROID[kind]) : playIos(kind);

  // Titreşim yalnızca his; desteklemeyen cihazda sessizce geçilir
  result.catch(() => undefined);
}

export const haptics = {
  // Değer değişti: sekme/segment geçişi, seçenek seçmek, kutu işaretlemek, anahtar, sayaç
  selection: () => play('selection'),
  // Grafikte parmakla gezinirken işaretli nokta değişti; çok sık çaldığı için en yumuşağı
  scrub: () => play('scrub'),
  // Uzun basışla bir mod açıldı (siparişlerde seçim modu)
  longPress: () => play('longPress'),
  // Sunucuya kaydetme başarılı, barkod okundu
  success: () => play('success'),
  // Riskli onay penceresi açıldı (silme, değişiklikleri at, çıkış), formda hatalı alan var
  warning: () => play('warning'),
  // Kaydetme/istek başarısız, barkodla ürün bulunamadı, bağlantı açılamadı
  error: () => play('error'),
};
