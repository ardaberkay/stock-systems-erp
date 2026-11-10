import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useEffect, useMemo, useState } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type ChartTimeAxisLabel = {
  text: string;
  // Noktanın grafik genişliğindeki yeri: 0 sol kenar, 1 sağ kenar
  ratio: number;
};

type ChartTimeAxisProps = {
  labels: ChartTimeAxisLabel[];
  colors: AppColors;
  // Yükleme bitince grafiğin çizimiyle aynı sürede belirir; yazılar çizgiden önce gelmez
  visible: boolean;
  fadeDuration: number;
  // Grafik uç noktaları, uçtaki yazı ortalanabilecek kadar içeri alabilsin diye
  onEdgeWidthChange?: (width: number) => void;
};

function getLabelKey(label: ChartTimeAxisLabel, index: number) {
  return `${label.text}-${index}`;
}

// Grafiğin altında ayrı satır; çizgi tam genişlikte kalırken etiketler üstüne binmez.
// Her etiket kendi noktasının tam altına ortalanır: o hizaya basan, yazan saati görür.
export default function ChartTimeAxis({
  labels,
  colors,
  visible,
  fadeDuration,
  onEdgeWidthChange,
}: ChartTimeAxisProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [rowWidth, setRowWidth] = useState(0);
  const [labelWidths, setLabelWidths] = useState<Record<string, number>>({});
  const opacity = useSharedValue(0);

  const firstLabel = labels[0];
  const lastLabel = labels[labels.length - 1];
  const firstWidth = firstLabel ? labelWidths[getLabelKey(firstLabel, 0)] : undefined;
  const lastWidth = lastLabel ? labelWidths[getLabelKey(lastLabel, labels.length - 1)] : undefined;
  const edgeWidth =
    firstWidth !== undefined && lastWidth !== undefined ? Math.max(firstWidth, lastWidth) : null;
  const isMeasured =
    rowWidth > 0 &&
    labels.every((label, index) => labelWidths[getLabelKey(label, index)] !== undefined);
  // Dönem değişince yazılar yeniden belirir
  const labelsKey = labels.map((label) => label.text).join('|');

  useEffect(() => {
    if (edgeWidth !== null) {
      onEdgeWidthChange?.(edgeWidth);
    }
  }, [edgeWidth, onEdgeWidthChange]);

  useEffect(() => {
    opacity.set(0);

    if (visible && isMeasured) {
      opacity.set(withTiming(1, { duration: fadeDuration }));
    }
  }, [visible, isMeasured, labelsKey, fadeDuration, opacity]);

  const rowStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View
      style={[styles.row, rowStyle]}
      onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
    >
      {labels.map((label, index) => {
        const key = getLabelKey(label, index);
        const labelWidth = labelWidths[key] ?? 0;
        // Kenardaki etiket ekrandan taşmasın diye içeri itilir
        const left =
          rowWidth > 0
            ? Math.min(
                Math.max(label.ratio * rowWidth - labelWidth / 2, SPACING.sm),
                rowWidth - labelWidth - SPACING.sm,
              )
            : 0;

        return (
          <Text
            key={key}
            style={[styles.label, { left }]}
            onLayout={(event) => {
              const width = event.nativeEvent.layout.width;
              setLabelWidths((current) =>
                current[key] === width ? current : { ...current, [key]: width },
              );
            }}
          >
            {label.text}
          </Text>
        );
      })}
    </Animated.View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      height: typography.caption.lineHeight,
      marginTop: SPACING.sm,
    },
    label: {
      ...typography.caption,
      position: 'absolute',
      top: 0,
      color: colors.textSecondary,
    },
  });
}
