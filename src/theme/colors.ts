
export const lightColors = {
    // Genel arka planlar
    background: '#FAF9F6',
    surface: '#FFFFFF',

    // Metinler
    text: '#252525',
    textSecondary: '#888782',
    textDisabled: '#B8B4AD',

    // Kenarlıklar
    border: '#EAE7E1',
    divider: '#EAE7E1',

    // Genel renk paleti
    orange: '#F97316',
    orangeLight: '#FFF0E5',
    purple: '#9B7BDB',
    green: '#43A889',
    blue: '#2F80ED',
    purpleLight: '#F0EAF9',
    greenLight: '#E8F5EF',
    blueLight: '#E8F1FD',

    // Kartlar
    card: {
        background: '#FFFFFF',
        border: '#EAE7E1',
    },

    // Butonlar
    buttonPrimary: '#F97316',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#FFFFFF',
    buttonSecondaryText: '#252525',
    buttonSecondaryBorder: '#EAE7E1',

    // Chip'ler
    chipActive: '#F97316',
    chipActiveText: '#FFFFFF',
    chipInactive: '#FFFFFF',
    chipInactiveText: '#888782',
    chipBorder: '#EAE7E1',

    // İkonlar
    icon: '#888782',
    iconActive: '#F97316',
    iconDisabled: '#B8B4AD',

    // Durum renkleri
    success: '#16865C',
    successBackground: '#E8F7EF',
    error: '#D94841',
    errorBackground: '#FDECEC',

    // Grafik yardımcı renkleri
    chartGrid: '#EAE7E1',
    chartAxis: '#888782',

    // Yardımcı renkler
    orangeWhite: '#F97316',
} as const;

// Açık temadaki renk yapısından otomatik türetilir.
export type AppColors = {
    [K in keyof typeof lightColors]:
    typeof lightColors[K] extends object
    ? { [C in keyof typeof lightColors[K]]: string }
    : string;
};

export const darkColors = {
    // Genel arka planlar
    background: '#1c1c1c',
    surface: '#222222',

    // Metinler
    text: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textDisabled: '#666666',

    // Kenarlıklar
    border: '#383838',
    divider: '#383838',

    // Genel renk paleti
    orange: '#F97316',
    orangeLight: '#3A2518',
    purple: '#B49AE8',
    green: '#43A889',
    blue: '#60A5FA',
    purpleLight: '#30263F',
    greenLight: '#20372F',
    blueLight: '#202F45',

    // Kartlar
    card: {
        background: '#222222',
        border: '#383838',
    },

    // Butonlar
    buttonPrimary: '#F97316',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#2B2B2B',
    buttonSecondaryText: '#F5F5F5',
    buttonSecondaryBorder: '#454545',

    // Chip'ler
    chipActive: '#F97316',
    chipActiveText: '#FFFFFF',
    chipInactive: '#2B2B2B',
    chipInactiveText: '#A3A3A3',
    chipBorder: '#454545',

    // İkonlar
    icon: '#A3A3A3',
    iconActive: '#F97316',
    iconDisabled: '#666666',

    // Durum renkleri
    success: '#4CCB91',
    successBackground: '#17372B',
    error: '#FF7770',
    errorBackground: '#3B2020',

    // Grafik yardımcı renkleri
    chartGrid: '#383838',
    chartAxis: '#A3A3A3',

    // Yardımcı renkler
    orangeWhite: '#FFFFFF',
} satisfies AppColors;  