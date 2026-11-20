import Badge from "@/components/ui/Badge";
import ProductMiniChart from "@/features/dashboard/components/ProductMiniChart";
import ProductColor from "@/features/products/components/ProductColor";
import ProductImage from "@/features/products/components/ProductImage";
import type { Product } from "@/features/products/schemas/products";
import type { AppColors } from "@/theme/colors";
import { SPACING } from "@/theme/spacing";
import { FONT_FAMILY, FONT_SIZE, typography } from "@/theme/typography";
import { formatMoney, formatNumber } from "@/utils/formatter";
import type { BestSeller } from "@/features/orders/utils/orderStats";
import Tag from "lucide-react-native/icons/tag";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Text from "@/components/ui/Text";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type TopSellingCardProps = {
  item: BestSeller;
  // Ürün bilgisi ayrı istekle gelir; hata olursa boş kalır.
  product: Product | undefined;
  colors: AppColors;
  locale: string;
};

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
    // Basınca ürün detayı açılır (sipariş detayındaki ürün satırları gibi)
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("orders.detail.openProduct", { name })}
      onPress={() =>
        router.push({
          pathname: "/product-detail/[id]",
          params: { id: String(item.productId) },
        })
      }
      style={styles.productCard}
    >
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
            <Badge
              label={t("dashboard.topSize", { size: item.topSize.name })}
              tone="outline"
            />
          )}
        </View>

        {/* Adet ve ciro ürünün toplamıdır; sağda alt alta tek blok gibi okunur */}
        <View style={styles.productSpacedRow}>
          <ProductColor colorName={product?.colorName} />

          {/* Siparişler sayfasındaki adet rozetinin aynısı */}
          <Badge
            label={formatNumber(item.sold, locale)}
            tone="purple"
            icon={Tag}
            compact
            slim
          />
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
    </Pressable>
  );
}

export default memo(TopSellingCard);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    productCard: {
      // Yazı büyütülünce kart uzar, metin kesilmez
      minHeight: 134,
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
