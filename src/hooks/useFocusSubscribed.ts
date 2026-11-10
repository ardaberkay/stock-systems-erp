import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';

// Sorgunun `subscribed` değeri. Odakta olmayan ekranın sorgusu dinlenmez: arkada istek atmaz,
// ekran odağa gelince veri eskidiyse yenilenir. Ama elinde hiç veri yoksa odaktan bağımsız
// dinlenir; böylece uygulama açılışında tüm sekmeler arkada yüklenir, ilk geçişte iskelet çıkmaz.
export function useFocusSubscribed(queryKey: QueryKey): boolean {
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();

  return isFocused || queryClient.getQueryData(queryKey) === undefined;
}
