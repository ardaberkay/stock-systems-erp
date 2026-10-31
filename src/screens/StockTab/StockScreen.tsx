import ProductCard from "@/components/cards/ProductCard";
import ProductCardSkeleton from "@/components/skeleton/ProductCardSkeleton";
import Skeleton from "@/components/skeleton/Skeleton";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import SearchFilterBar from "@/components/ui/SearchFilterBar";
import StateMessage from "@/components/ui/StateMessage";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocale } from "@/hooks/useLocale";
import { useProductList } from "@/hooks/useProductList";
import { getErrorMessageKey } from "@/lib/apiError";
import type { Product } from "@/schemas/products";
import type { AppColors } from "@/theme/colors";
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from "@/theme/spacing";
import { FONT_FAMILY, typography } from "@/theme/typography";
import { formatNumber } from "@/utils/formatter";
import { router, useNavigation } from "expo-router";
import {
  DrawerActions,
  type NavigationProp,
  type NavigationState,
  type ParamListBase,
} from "expo-router/react-navigation";
import FolderCog from "lucide-react-native/icons/folder-cog";
import Menu from "lucide-react-native/icons/menu";
import Plus from "lucide-react-native/icons/plus";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// expo-router sekme olayının tipini dışa açmıyor; yalnızca dinlenen olay tanımlanır
type TabsNavigation = NavigationProp<
  ParamListBase,
  string,
  undefined,
  NavigationState,
  object,
  { tabPress: { data: undefined } }
>;

const SKELETON_CARD_KEYS = ["first", "second", "third", "fourth"];
const FAB_SPACE = 88;
// Liste panelin köşe yuvarlaklığı kadar altına girer; köşelerde arkadaki kartlar görünür
const HEADER_OVERLAP = RADIUS.xxl;

export default function StockScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<TabsNavigation>();
  const listRef = useRef<FlatList<Product>>(null);
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // iOS'ta sekme çubuğu ekranın üstüne biner ve bu değere dahildir; Android'de ekran çubuğun üstünde biter
  const fabOffset = Platform.OS === "ios" ? insets.bottom : 0;
  const [searchText, setSearchText] = useState("");
  // Aynı anda tek kart açık kalır; liste uzayıp karışmaz
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const {
    products,
    isFiltering,
    hasActiveFilters,
    isLoading,
    error,
    isRefreshing,
    refresh,
  } = useProductList(searchText);

  // iOS'ta sekmenin kendi başa dönme davranışı kaydırma alanını bulamıyor: ilk görünüm sabit panel.
  // Başka sekmeden gelince konum korunur, yalnızca açık sekmeye tekrar basınca başa döner.
  useEffect(
    () =>
      navigation.addListener("tabPress", () => {
        if (navigation.isFocused()) {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      }),
    [navigation],
  );

  const toggleProduct = useCallback((productId: number) => {
    setExpandedId((current) => (current === productId ? null : productId));
  }, []);

  const renderProduct = useCallback<ListRenderItem<Product>>(
    ({ item }) => (
      <ProductCard
        product={item}
        isExpanded={item.id === expandedId}
        onToggle={toggleProduct}
        colors={colors}
        locale={locale}
      />
    ),
    [expandedId, toggleProduct, colors, locale],
  );

  return (
    <View style={styles.screen}>
      {/* Sabit üst panel: durum çubuğundan başlar, liste alt köşelerinin arkasından akar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* Appbar: menü, başlık ve katalog yönetimi */}
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("drawer.open")}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.iconButton}
          >
            <Menu size={ICON_SIZE.lg} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>{t("tabs.stock")}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("stock.catalog.title")}
            onPress={() => router.push("/product-catalog")}
            style={styles.iconButton}
          >
            <FolderCog size={ICON_SIZE.lg} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <SearchFilterBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t("stock.searchPlaceholder")}
            filterLabel={t("stock.filterTitle")}
            isFilterActive={hasActiveFilters}
            onFilterPress={() => router.push("/product-filters")}
          />
        </View>
      </View>

      {error && products.length === 0 ? (
        <StateMessage
          message={t(getErrorMessageKey(error))}
          onRetry={refresh}
        />
      ) : isLoading ? (
        <View style={styles.list}>
          <View style={styles.resultCount}>
            <Skeleton width={72} height={typography.caption.lineHeight} />
          </View>

          {SKELETON_CARD_KEYS.map((key) => (
            <ProductCardSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          extraData={expandedId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.orange}
              progressViewOffset={HEADER_OVERLAP}
            />
          }
          ListHeaderComponent={
            <Text style={styles.resultCount} numberOfLines={1}>
              {t(isFiltering ? "stock.resultCount" : "stock.productCount", {
                value: formatNumber(products.length, locale),
              })}
            </Text>
          }
          ListEmptyComponent={
            <StateMessage
              message={t(isFiltering ? "stock.noResults" : "stock.empty")}
            />
          }
        />
      )}

      <FloatingActionButton
        icon={Plus}
        accessibilityLabel={t("stock.addProduct")}
        onPress={() => Alert.alert(t("common.comingSoon"))}
        bottomOffset={fabOffset}
      />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      zIndex: 1,
      marginBottom: -HEADER_OVERLAP,
      paddingBottom: SPACING.sm,
      borderBottomLeftRadius: RADIUS.xl,
      borderBottomRightRadius: RADIUS.xl,
      backgroundColor: colors.background,
    },
    topBar: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: SPACING.xl,
    },
    iconButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...typography.h3,
      color: colors.text,
      fontFamily: FONT_FAMILY.bold,
    },
    searchRow: {
      marginHorizontal: SPACING.xl,
    },
    // Liste kenar boşluğuna eklenince yatayda arama satırıyla hizalanır
    resultCount: {
      ...typography.caption,
      color: colors.textSecondary,
      marginHorizontal: SPACING.sm,
    },
    list: {
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingTop: HEADER_OVERLAP + SPACING.xs,
      // Son kart ekleme butonunun altında kalmasın; sekme çubuğu boşluğunu iOS kendisi ekler
      paddingBottom: FAB_SPACE,
    },
  });
}
