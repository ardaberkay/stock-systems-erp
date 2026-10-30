import type { Period } from '@/constants/periods';

export type ChartPoint = {
    time: string;
    revenue: number;
};

export type MiniChartPoint = {
    time: string;
    sold: number;
};

export type Product = {
    name: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    sold: number;
    price: number;
};

export const chartData: Record<Period, ChartPoint[]> = {
    today: [
        { time: '09:00', revenue: 1200 },
        { time: '10:00', revenue: 1850 },
        { time: '11:00', revenue: 1500 },
        { time: '12:00', revenue: 3200 },
        { time: '13:00', revenue: 2600 },
        { time: '14:00', revenue: 4100 },
        { time: '15:00', revenue: 3500 },
        { time: '16:00', revenue: 5200 },
        { time: '17:00', revenue: 4300 },
        { time: '18:00', revenue: 4800 },
        { time: '19:00', revenue: 3900 },
        { time: '20:00', revenue: 4330 },
        { time: '21:00', revenue: 3600 },
    ],
    yesterday: [
        { time: '09:00', revenue: 900 },
        { time: '10:00', revenue: 1600 },
        { time: '11:00', revenue: 2100 },
        { time: '12:00', revenue: 2800 },
        { time: '13:00', revenue: 2200 },
        { time: '14:00', revenue: 3700 },
        { time: '15:00', revenue: 3100 },
        { time: '16:00', revenue: 4500 },
        { time: '17:00', revenue: 3900 },
        { time: '18:00', revenue: 4200 },
        { time: '19:00', revenue: 3500 },
        { time: '20:00', revenue: 3300 },
        { time: '21:00', revenue: 2500 },
    ],
    weekly: [
        { time: 'Pzt', revenue: 12500 },
        { time: 'Sal', revenue: 15800 },
        { time: 'Çar', revenue: 14200 },
        { time: 'Per', revenue: 19600 },
        { time: 'Cum', revenue: 22400 },
        { time: 'Cmt', revenue: 28100 },
        { time: 'Paz', revenue: 24500 },
        { time: 'Pzt', revenue: 17800 },
        { time: 'Sal', revenue: 20500 },
        { time: 'Çar', revenue: 19200 },
        { time: 'Per', revenue: 23400 },
        { time: 'Cum', revenue: 26500 },
    ],
    monthly: [
        { time: '1', revenue: 82000 },
        { time: '3', revenue: 96500 },
        { time: '5', revenue: 88400 },
        { time: '8', revenue: 112000 },
        { time: '10', revenue: 103000 },
        { time: '13', revenue: 124000 },
        { time: '15', revenue: 118000 },
        { time: '18', revenue: 139000 },
        { time: '20', revenue: 128000 },
        { time: '23', revenue: 148000 },
        { time: '26', revenue: 157000 },
        { time: '30', revenue: 164000 },
    ],
    yearly: [
        { time: 'Oca', revenue: 240000 },
        { time: 'Şub', revenue: 218000 },
        { time: 'Mar', revenue: 275000 },
        { time: 'Nis', revenue: 252000 },
        { time: 'May', revenue: 310000 },
        { time: 'Haz', revenue: 292000 },
        { time: 'Tem', revenue: 345000 },
        { time: 'Ağu', revenue: 328000 },
        { time: 'Eyl', revenue: 372000 },
        { time: 'Eki', revenue: 354000 },
        { time: 'Kas', revenue: 398000 },
        { time: 'Ara', revenue: 425000 },
    ],
};

export const revenueTotals: Record<Period, number> = {
    today: 24580,
    yesterday: 21800,
    weekly: 154600,
    monthly: 612400,
    yearly: 3812500,
};

export const periodMultipliers: Record<Period, number> = {
    today: 1,
    yesterday: 0.9,
    weekly: 5.8,
    monthly: 24,
    yearly: 280,
};

export const miniChartData: Record<Period, MiniChartPoint[]> = {
    today: [
        { time: '09', sold: 8 },
        { time: '10', sold: 13 },
        { time: '11', sold: 10 },
        { time: '12', sold: 18 },
        { time: '13', sold: 15 },
        { time: '14', sold: 24 },
        { time: '15', sold: 20 },
        { time: '16', sold: 29 },
        { time: '17', sold: 23 },
        { time: '18', sold: 27 },
        { time: '19', sold: 21 },
        { time: '20', sold: 25 },
    ],
    yesterday: [
        { time: '09', sold: 6 },
        { time: '10', sold: 10 },
        { time: '11', sold: 14 },
        { time: '12', sold: 12 },
        { time: '13', sold: 17 },
        { time: '14', sold: 22 },
        { time: '15', sold: 18 },
        { time: '16', sold: 25 },
        { time: '17', sold: 21 },
        { time: '18', sold: 24 },
        { time: '19', sold: 19 },
        { time: '20', sold: 15 },
    ],
    weekly: [
        { time: 'Pzt', sold: 12 },
        { time: 'Sal', sold: 17 },
        { time: 'Çar', sold: 14 },
        { time: 'Per', sold: 22 },
        { time: 'Cum', sold: 19 },
        { time: 'Cmt', sold: 28 },
        { time: 'Paz', sold: 24 },
    ],
    monthly: [
        { time: '1', sold: 15 },
        { time: '5', sold: 20 },
        { time: '8', sold: 17 },
        { time: '12', sold: 26 },
        { time: '15', sold: 22 },
        { time: '19', sold: 30 },
        { time: '23', sold: 25 },
        { time: '27', sold: 34 },
        { time: '30', sold: 29 },
    ],
    yearly: [
        { time: 'Oca', sold: 16 },
        { time: 'Şub', sold: 13 },
        { time: 'Mar', sold: 20 },
        { time: 'Nis', sold: 18 },
        { time: 'May', sold: 25 },
        { time: 'Haz', sold: 22 },
        { time: 'Tem', sold: 29 },
        { time: 'Ağu', sold: 26 },
        { time: 'Eyl', sold: 34 },
        { time: 'Eki', sold: 30 },
        { time: 'Kas', sold: 37 },
        { time: 'Ara', sold: 41 },
    ],
};

export const baseProducts: Product[] = [
    {
        name: 'Oversize Tişört',
        sku: 'TS-001',
        size: 'L',
        color: 'Siyah',
        colorHex: '#252525',
        sold: 128,
        price: 450,
    },
    {
        name: 'Basic Tişört',
        sku: 'TS-002',
        size: 'M',
        color: 'Beyaz',
        colorHex: '#FFFFFF',
        sold: 96,
        price: 350,
    },
    {
        name: 'Kapüşonlu Sweatshirt',
        sku: 'SW-001',
        size: 'XL',
        color: 'Gri',
        colorHex: '#A8A8A8',
        sold: 84,
        price: 850,
    },
    {
        name: 'Regular Fit Gömlek',
        sku: 'GM-001',
        size: 'L',
        color: 'Mavi',
        colorHex: '#527DA8',
        sold: 72,
        price: 750,
    },
    {
        name: 'Straight Jean',
        sku: 'JN-001',
        size: '32',
        color: 'Lacivert',
        colorHex: '#273B65',
        sold: 65,
        price: 1100,
    },
    {
        name: 'Basic Hoodie',
        sku: 'HD-001',
        size: 'M',
        color: 'Siyah',
        colorHex: '#252525',
        sold: 58,
        price: 900,
    },
    {
        name: 'Keten Pantolon',
        sku: 'PN-001',
        size: 'L',
        color: 'Bej',
        colorHex: '#D7C4A5',
        sold: 46,
        price: 950,
    },
    {
        name: 'Polo Yaka Tişört',
        sku: 'TS-003',
        size: 'M',
        color: 'Beyaz',
        colorHex: '#FFFFFF',
        sold: 42,
        price: 550,
    },
    {
        name: 'Denim Ceket',
        sku: 'CK-001',
        size: 'L',
        color: 'Mavi',
        colorHex: '#527DA8',
        sold: 35,
        price: 1450,
    },
    {
        name: 'Basic Şort',
        sku: 'ST-001',
        size: 'M',
        color: 'Bej',
        colorHex: '#D7C4A5',
        sold: 29,
        price: 500,
    },
];

const DAY_MS = 24 * 60 * 60 * 1000;

// Mock: seçilen tarih aralığı için ciro, çarpan ve grafiğin hangi dönem verisini
// kullanacağı. Backend gelince bu hesap sunucudan gelen veriyle değişecek.
export function getRangeMock(from: Date, to: Date) {
    const days = Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;
    const chartPeriod: Period =
        days <= 1 ? 'today' : days <= 7 ? 'weekly' : days <= 31 ? 'monthly' : 'yearly';
    // Tarihe göre küçük bir oynama, aynı aralık her seferinde aynı sonucu verir
    const variation = 1 + ((from.getDate() % 5) - 2) * 0.035;

    return {
        chartPeriod,
        totalRevenue: Math.round(revenueTotals.today * days * variation),
        multiplier: days,
    };
}
