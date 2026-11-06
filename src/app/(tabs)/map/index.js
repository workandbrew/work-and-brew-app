import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CafePhoto from '../../../components/CafePhoto';
import Icon from '../../../components/Icon';
import MapStandIn, { project } from '../../../components/MapStandIn';
import { NEIGHBORHOODS, QUICK_FILTERS } from '../../../data/cafes';
import { notify } from '../../../lib/alert';
import { filterCafes, useApp } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';
import useLayout from '../../../theme/useLayout';

export default function CafeMap() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { gutter, isTablet } = useLayout();
  const g = isTablet ? gutter : 16;
  const { state, toggleFilter } = useApp();
  const [hood, setHood] = useState(null);
  const [panelH, setPanelH] = useState(360);
  const [selected, setSelected] = useState(null);

  const cafes = useMemo(() => filterCafes(state.filters, { neighborhood: hood }), [state.filters, hood]);
  const pins = useMemo(
    () => project(cafes, { x: g + 44, y: panelH + 70, w: Math.max(40, width - (g + 44) * 2), h: Math.max(60, height - panelH - 300) }),
    [cafes, panelH, width, height, g]
  );
  const sel = pins.find((p) => p.cafe.id === selected) || null;
  const place = hood || 'NYC';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MapStandIn pins={pins} selectedId={selected} onSelect={(c) => setSelected(c.id === selected ? null : c.id)} />

      {sel && (
        <Pressable onPress={() => router.push(`/map/cafe/${sel.cafe.id}`)} accessibilityLabel={`Open ${sel.cafe.name}`}
          style={[s.pop, { left: Math.min(Math.max(12, sel.x - 80), width - 250), top: sel.y - 100 }]}>
          <CafePhoto cafe={sel.cafe} style={s.popImg} />
          <View>
            <Text style={s.popName}>{sel.cafe.name}</Text>
            <Text style={s.popSub}>{sel.cafe.distanceMi} mi, open until {sel.cafe.openUntil}</Text>
          </View>
        </Pressable>
      )}

      <View style={[s.panel, { paddingTop: insets.top + 10 }]} onLayout={(e) => setPanelH(e.nativeEvent.layout.height)}>
        <View style={{ paddingHorizontal: g }}>
          <Text style={s.kicker}>Near you</Text>
          <Text style={s.title}>Café Map</Text>
          <View style={s.searchRow}>
            <Pressable style={s.search} onPress={() => router.push('/map/search')} accessibilityRole="search">
              <Icon name="search" size={20} color={colors.muted} />
              <Text style={s.searchText}>Search cafés</Text>
            </Pressable>
            <Pressable style={s.filters} onPress={() => router.push('/map/filters')} accessibilityLabel="Filters">
              <Icon name="filters" size={20} color={colors.onPrimary} />
              <Text style={s.filtersText}>Filters</Text>
              {state.filters.length > 0 && <View style={s.badge}><Text style={s.badgeText}>{state.filters.length}</Text></View>}
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.hoods, { paddingHorizontal: g }]}>
          {NEIGHBORHOODS.map((n) => {
            const on = hood === n;
            return (
              <Pressable key={n} onPress={() => { setHood(on ? null : n); setSelected(null); }} style={[s.hood, on && s.hoodOn]}>
                <Icon name="pin" size={17} color={on ? colors.onPrimary : colors.text} />
                <Text style={[s.hoodText, on && { color: colors.onPrimary }]}>{n}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.quick, { paddingHorizontal: g }]}>
          {QUICK_FILTERS.map((q) => {
            const on = state.filters.includes(q.key);
            return (
              <Pressable key={q.key} onPress={() => toggleFilter(q.key)} style={s.qItem} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                <View style={[s.qIcon, on && { backgroundColor: colors.primary }]}>
                  <Icon name={q.icon} size={22} color={on ? colors.onPrimary : colors.text} />
                </View>
                <Text style={s.qText}>{q.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[s.bottomRow, { bottom: insets.bottom + 140, right: g }]}>
        <Pressable style={s.countPill} onPress={() => router.push({ pathname: '/map/list', params: hood ? { hood } : {} })}>
          <Icon name="list" size={18} color={colors.text} />
          <Text style={s.countText}>{cafes.length} café{cafes.length === 1 ? '' : 's'} in {place}</Text>
        </Pressable>
        <Pressable style={s.locate} accessibilityLabel="Center on my location"
          onPress={() => notify('Location', state.privacy.location
            ? 'Live location arrives with the real map. Showing sample cafés for now.'
            : 'Location is off. Turn it on in Profile > Privacy and data.')}>
          <Icon name="locate" size={22} color={colors.navy} />
        </Pressable>
      </View>
      <Text style={[s.attr, { bottom: insets.bottom + 118, left: g - 6 }]}>Map preview · sample data</Text>
    </View>
  );
}

const s = StyleSheet.create({
  panel: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.bg, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, paddingBottom: 14 },
  kicker: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text },
  searchRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  search: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  searchText: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
  filters: { height: 48, borderRadius: 24, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  filtersText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.onPrimary },
  badge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.steel, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.navy },
  hoods: { gap: 8, marginTop: 12 },
  hood: { height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14 },
  hoodOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  hoodText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  quick: { gap: 14, marginTop: 12 },
  qItem: { alignItems: 'center', width: 62 },
  qIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  qText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginTop: 6 },
  pop: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg, borderRadius: 12, padding: 7, paddingRight: 14, width: 240 },
  popImg: { width: 40, height: 40, borderRadius: 6 },
  popName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  popSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
  bottomRow: { position: 'absolute', left: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  countPill: { height: 46, borderRadius: 23, backgroundColor: colors.bg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18 },
  countText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  locate: { position: 'absolute', right: 0, width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  attr: { position: 'absolute', fontFamily: fonts.medium, fontSize: 9.5, color: '#6E6159', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
});
