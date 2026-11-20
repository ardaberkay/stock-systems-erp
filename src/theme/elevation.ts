// Detay sayfalarındaki çerçevesiz beyaz grupların gölgesi (DetailSection "plain" ve aynı
// görünümdeki kutular). Zemin (background) ile beyaz grup neredeyse aynı renk; çerçeve yerine
// çok hafif bir gölge grubu zeminden ayırır. Gölge rengi verilmez, platformun varsayılan
// siyahı kullanılır.
export const SOFT_SHADOW = {
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 1,
} as const;
