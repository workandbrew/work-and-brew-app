import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import Icon from './Icon';

const ROWS = [
  { key: 'wifi', label: 'Wi-Fi', icon: 'shield' },
  { key: 'outlets', label: 'Outlets', icon: 'plug' },
  { key: 'seating', label: 'Seating', icon: 'seat' },
  { key: 'laptops', label: 'Laptops', icon: 'laptop' },
  { key: 'restroom', label: 'Restroom', icon: 'restroom' },
  { key: 'vibe', label: 'Vibe', icon: 'quiet' },
];

export function AmenityGrid({ cafe, limit = 6 }) {
  return (
    <View style={s.grid}>
      {ROWS.slice(0, limit).map((r) => (
        <View key={r.key} style={s.cell}>
          <View style={s.k}><Icon name={r.icon} size={15} color={colors.muted} /><Text style={s.kText}>{r.label}</Text></View>
          <Text style={s.v}>{cafe.amenities[r.key]}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  cell: { width: '48.5%', flexGrow: 1, flexBasis: '45%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 13 },
  k: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kText: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
  v: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginTop: 4 },
});
