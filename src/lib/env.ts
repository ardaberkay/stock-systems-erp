// EXPO_PUBLIC_ değişkenleri build sırasında koda gömülür; buraya gizli bilgi konmaz.
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  // GEÇİCİ: login ekranı gelene kadar test hesabı .env'den okunur. Mağazaya çıkmadan
  // kaldırılacak; kullanıcı bilgileri girişte alınıp expo-secure-store'da tutulacak.
  devUsername: process.env.EXPO_PUBLIC_API_USERNAME ?? '',
  devPassword: process.env.EXPO_PUBLIC_API_PASSWORD ?? '',
} as const;
