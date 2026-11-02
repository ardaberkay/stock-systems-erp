import type { OrderStatusTone } from '@/constants/orderStatusDisplay';
import type { AppColors } from '@/theme/colors';

export function getOrderStatusToneColors(tone: OrderStatusTone, colors: AppColors) {
  switch (tone) {
    case 'orange':
      return { text: colors.orange, background: colors.orangeLight };
    case 'blue':
      return { text: colors.blue, background: colors.blueLight };
    case 'green':
      return { text: colors.green, background: colors.greenLight };
    case 'purple':
      return { text: colors.purple, background: colors.purpleLight };
    case 'success':
      return { text: colors.success, background: colors.successBackground };
    case 'error':
      return { text: colors.error, background: colors.errorBackground };
    case 'neutral':
      return { text: colors.textSecondary, background: colors.background };
  }
}
