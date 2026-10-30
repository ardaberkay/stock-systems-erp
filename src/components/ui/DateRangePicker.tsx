import { Calendar, type DateRange } from 'panelui-native';
import { StyleSheet, View } from 'react-native';

type DateRangePickerProps = {
  // İlk dokunuştan sonra yalnızca `from` dolu, ikinci dokunuşta `to` gelir
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  locale: string;
  maxDate?: Date;
};

// Satır içi tarih aralığı seçici. panelui'nin DatePicker'ı yalnızca kendi
// popover/sheet'iyle açıldığı için Calendar doğrudan kullanılır.
export default function DateRangePicker({ value, onChange, locale, maxDate }: DateRangePickerProps) {
  return (
    // Calendar'ın sabit genişliği yok, gün hücreleri flex: 1; kapsayıcı tam genişlik
    // vermezse hücreler daralıp iç içe geçer.
    <View style={styles.container}>
      <Calendar
        mode="range"
        selected={value}
        onSelect={onChange}
        defaultMonth={value?.to ?? value?.from}
        maxDate={maxDate}
        locale={locale}
        bordered={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
});
