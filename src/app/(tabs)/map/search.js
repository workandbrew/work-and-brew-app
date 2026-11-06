import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Icon from '../../../components/Icon';
import { BackHeader, CafeRow, Screen, T } from '../../../components/ui';
import { filterCafes } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';

export default function Search() {
  const [q, setQ] = useState('');
  const results = useMemo(() => filterCafes([], { query: q }), [q]);
  return (
    <Screen>
      <BackHeader title="Search" />
      <View style={s.box}>
        <Icon name="search" size={20} color={colors.text} />
        <TextInput value={q} onChangeText={setQ} placeholder="Café or neighborhood" placeholderTextColor="#7A6E66" autoFocus
          style={s.input} returnKeyType="search" selectionColor={colors.steel} />
        {q ? <Icon name="close" size={18} color={colors.muted} /> : null}
      </View>
      <T variant="label" style={{ marginTop: 18, marginBottom: 6 }}>Results</T>
      {results.map((c) => <CafeRow key={c.id} cafe={c} onPress={() => router.push(`/map/cafe/${c.id}`)} />)}
      {!results.length && <T variant="muted">No cafés match “{q}” yet.</T>}
    </Screen>
  );
}

const s = StyleSheet.create({
  box: { height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 },
  input: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text, height: '100%', outlineStyle: 'none' },
});
