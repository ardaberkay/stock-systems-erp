import { useNavigation } from 'expo-router';
import type {
  NavigationProp,
  NavigationState,
  ParamListBase,
} from 'expo-router/react-navigation';
import { useEffect, type RefObject } from 'react';

// expo-router sekme olayının tipini dışa açmıyor; yalnızca dinlenen olay tanımlanır
type TabsNavigation = NavigationProp<
  ParamListBase,
  string,
  undefined,
  NavigationState,
  object,
  { tabPress: { data: undefined } }
>;

type Scrollable = {
  scrollTo: (options: { y: number; animated: boolean }) => void;
};

// Appbar sabit olunca iOS'ta sekmenin kendi başa dönme davranışı kaydırma alanını bulamaz.
// Başka sekmeden gelince konum korunur, yalnızca açık sekmeye tekrar basınca başa döner.
export function useTabPressScrollToTop(scrollRef: RefObject<Scrollable | null>) {
  const navigation = useNavigation<TabsNavigation>();

  useEffect(
    () =>
      navigation.addListener('tabPress', () => {
        if (navigation.isFocused()) {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
      }),
    [navigation, scrollRef],
  );
}
