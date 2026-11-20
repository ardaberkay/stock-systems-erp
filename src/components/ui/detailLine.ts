// DetailSection "plain" art arda gelen satırların arasına ince çizgi koyar. Satır bileşenleri
// (DetailRow, DetailNote) bu işaretle tanınır; ayraç, alt başlık, görsel gibi parçalarda yoktur.
export const DETAIL_LINE_MARK = 'isDetailLine';

export function markAsDetailLine(component: object) {
  Object.defineProperty(component, DETAIL_LINE_MARK, { value: true });
}
