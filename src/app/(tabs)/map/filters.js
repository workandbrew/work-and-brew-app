import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapSheet from '../../../components/Sheet';
import { Button, PillGroup, Segmented } from '../../../components/ui';
import { FILTER_GROUPS } from '../../../data/cafes';
import { filterCafes, useApp } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';

export default function Filters() {
  const { state, toggleFilter, resetFilters } = useApp();
  const [tab, setTab] = useState('work');
  const count = filterCafes(state.filters).length;
  const offsets = useRef({});
  const scroller = useRef(null);
  const jump = (k) => {
    setTab(k);
    scroller.current?.scrollTo({ y: Math.max(0, (offsets.current[k] || 0) - 12), animated: true });
  };

  return (
    <MapSheet top={60} scrollRef={scroller}
      footer={<Button title={`Show ${count} café${count === 1 ? '' : 's'}`} variant="primary" size="lg" onPress={() => router.back()} />}>
      <View style={s.head}>
        <Text style={s.title}>Filters</Text>
        <Button title="Reset" size="sm" onPress={resetFilters} />
      </View>
      <Segmented style={{ marginTop: 14 }} value={tab} onChange={jump}
        options={FILTER_GROUPS.map((g) => ({ key: g.key, label: g.title }))} />
      {FILTER_GROUPS.map((g) => (
        <View key={g.key} onLayout={(e) => (offsets.current[g.key] = e.nativeEvent.layout.y)}
          style={s.group}>
          <Text style={s.gTitle}>{g.title}</Text>
          <Text style={s.gSub}>{g.subtitle}</Text>
          <PillGroup options={g.options} selected={state.filters} onToggle={toggleFilter} />
        </View>
      ))}
    </MapSheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text },
  group: { marginTop: 20 },
  gTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  gSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2, marginBottom: 12 },
});
