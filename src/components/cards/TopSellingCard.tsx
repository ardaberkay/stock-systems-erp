import ProductMiniChart from "@/components/charts/ProductMiniChart";
import ProductColor from "@/components/ui/product/ProductColor";
import ProductImage from "@/components/ui/product/ProductImage";
import type { Product } from "@/schemas/products";
import type { AppColors } from "@/theme/colors";
import { ICON_SIZE, RADIUS, SPACING } from "@/theme/spacing";
import { FONT_FAMILY, FONT_SIZE, typography } from "@/theme/typography";
import { formatMoney, formatNumber } from "@/utils/formatter";
import type { BestSeller } from "@/utils/orderStats";
import Tag from "lucide-react-native/icons/tag";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

type TopSellingCardProps = {
  item: BestSeller;
  // Ürün bilgisi ayrı istekle gelir; hata olursa boş kalır.
  product: Product | undefined;
  colors: AppColors;
  locale: string;
};

const SMALL_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;
const MAX_CHART_WIDTH = 110;

// Grafik çizgisi açıp kapatmak ekranı yeniler; 10 kartın küçük grafikleri boşuna çizilmesin.
function TopSellingCard({
  item,
  product,
  colors,
  locale,
}: TopSellingCardProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const name =
    product?.name ?? t("dashboard.productFallback", { id: item.productId });

  return (
    <View style={styles.productCard}>
      <ProductImage uri={product?.image} accessibilityLabel={name} />

      {/* Sabit kart boyunda içerik ortalanır; ad tek satırsa boşluk kalmaz */}
      <View style={styles.productContent}>
        <Text
          style={styles.productName}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </Text>

        <View style={styles.productRow}>
          {product?.modelCode && (
            <Text style={styles.productSku} numberOfLines={1}>
              {product.modelCode}
            </Text>
          )}

          {item.topSize && (
            <View style={styles.productTopSize}>
              <Text style={styles.productTopSizeName} numberOfLines={1}>
                {t("dashboard.topSize", { size: item.topSize.name })}
              </Text>
            </View>
          )}
        </View>

        {/* Adet ve ciro ürünün toplamıdır; sağda alt alta tek blok gibi okunur */}
        <View style={styles.productSpacedRow}>
          <ProductColor colorName={product?.colorName} />

          <View style={styles.productSoldBadge}>
            <Tag size={SMALL_ICON_SIZE} color={colors.purple} />
            <Text style={styles.productSold} numberOfLines={1}>
              {formatNumber(item.sold, locale)}
            </Text>
          </View>
        </View>

        {/* Ciro küçülmez; rakam uzarsa grafik daralır */}
        <View style={styles.productSpacedRow}>
          <View style={styles.productChart}>
            <ProductMiniChart trend={item.trend} colors={colors} />
          </View>

          <Text style={styles.productRevenue} numberOfLines={1}>
            {formatMoney(item.revenue, locale)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default memo(TopSellingCard);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    productCard: {
      height: 134,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.md,
    },
    productContent: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
      gap: SPACING.xs,
    },
    productName: {
      ...typography.label,
      color: colors.text,
      fontSize: FONT_SIZE.sm,
      fontFamily: FONT_FAMILY.bold,
      lineHeight: 16,
    },
    productRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      minWidth: 0,
    },
    productSpacedRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.md,
      minWidth: 0,
    },
    productSku: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.italic,
      flexShrink: 1,
    },
    productTopSize: {
      flexShrink: 0,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    productTopSizeName: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.semiBold,
    },
    productSoldBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xxs,
      flexShrink: 0,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.purpleLight,
    },
    productSold: {
      ...typography.caption,
      color: colors.purple,
      fontFamily: FONT_FAMILY.bold,
    },
    productChart: {
      flex: 1,
      minWidth: 0,
      maxWidth: MAX_CHART_WIDTH,
    },
    productRevenue: {
      ...typography.h3,
      color: colors.orangeWhite,
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: -0.4,
      flexShrink: 0,
    },
  });
}
