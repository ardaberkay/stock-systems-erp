// EXPO_PUBLIC_ değişkenleri build sırasında koda gömülür; buraya gizli bilgi konmaz.
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
} as const;
