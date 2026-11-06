import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../../../components/Icon';
import { Button, CafeRow, CircleButton, PageTitle, Screen, Segmented } from '../../../components/ui';
import { getCafe } from '../../../services';
import { useApp } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';

const LISTS = [
  { key: 'all', label: 'All' },
  { key: 'deep', label: 'Deep focus' },
  { key: 'weekends', label: 'Weekends' },
];

export default function Saved() {
  const { state, toggleSaved, joinWaitlist } = useApp();
  const [list, setList] = useState('all');
  const items = state.saved.filter((x) => list === 'all' || x.list === list).map((x) => getCafe(x.cafeId)).filter(Boolean);
  const notified = state.waitlists.saved;

  return (
    <Screen>
      <PageTitle kicker="Your lists" title="Saved" />
      <Segmented options={LISTS} value={list} onChange={setList} style={{ marginBottom: 14 }} />
      {items.map((c) => (
        <CafeRow key={c.id} cafe={c} subtitle={`${c.neighborhood} · ${c.distanceMi} mi`} onPress={() => router.push(`/map/cafe/${c.id}`)}
          right={<CircleButton icon="close" label={`Remove ${c.name}`} size={40} iconSize={16} style={{ backgroundColor: 'transparent' }} onPress={() => toggleSaved(c.id)} />} />
      ))}
      {!items.length && (
        <Text style={s.none}>{list === 'all' ? 'No saved cafés yet. Tap the bookmark on any café.' : 'Nothing in this list yet.'}</Text>
      )}
      <View style={s.empty}>
        <View style={s.cup}><Icon name="cup" size={22} color={colors.text} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.eTitle}>Something new is brewing</Text>
          <Text style={s.eSub}>A new space is coming to Saved. Stay tuned.</Text>
        </View>
        <Button title={notified ? "You're in" : 'Notify me'} icon={notified ? 'check' : undefined} size="sm" onPress={() => joinWaitlist('saved')} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  none: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginVertical: 10 },
  empty: { marginTop: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.beige, borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  cup: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  eTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  eSub: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: colors.muted, marginTop: 2 },
});
