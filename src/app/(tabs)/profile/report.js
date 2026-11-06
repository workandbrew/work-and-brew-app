import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BackHeader, Button, Field, Label, PillGroup, Screen } from '../../../components/ui';
import Sent from '../../../components/Sent';
import { ISSUE_TYPES } from '../../../data/cafes';
import { notify } from '../../../lib/alert';
import * as api from '../../../services';
import { filterCafes } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';

export default function Report() {
  const params = useLocalSearchParams();
  const [type, setType] = useState(ISSUE_TYPES[0]);
  const [cafe, setCafe] = useState(params.cafe || '');
  const [picked, setPicked] = useState(!!params.cafe);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const matches = useMemo(() => (cafe && !picked ? filterCafes([], { query: cafe }).slice(0, 4) : []), [cafe, picked]);

  const send = async () => {
    if (!details.trim()) return notify('Tell us what happened', 'A sentence or two helps us fix it fast.');
    setBusy(true);
    try { await api.submitReport({ type, cafe, details }); setSent(true); } finally { setBusy(false); }
  };

  if (sent) {
    return (
      <Screen>
        <BackHeader title="Report an issue" />
        <Sent title="Report sent" body="Thanks. Our team reviews every report, usually within a few days." />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title="Report an issue" />
      <Label style={{ marginTop: 0 }}>What's wrong?</Label>
      <PillGroup options={ISSUE_TYPES} selected={[type]} onToggle={setType} />
      <Label>Café (optional)</Label>
      <Field value={cafe} onChangeText={(v) => { setCafe(v); setPicked(false); }} placeholder="Search a café" />
      {matches.length > 0 && (
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, marginTop: 6, borderWidth: 1, borderColor: colors.line }}>
          {matches.map((c) => (
            <Pressable key={c.id} onPress={() => { setCafe(c.name); setPicked(true); }} style={{ padding: 13 }}>
              <Text style={{ fontFamily: fonts.semibold, color: colors.text }}>{c.name}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted }}>{c.neighborhood}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Label>Details</Label>
      <Field multiline value={details} onChangeText={setDetails} placeholder="Tell us what happened" />
      <Button title={busy ? 'Sending…' : 'Send report'} variant="primary" size="lg" style={{ marginTop: 20 }} onPress={send} disabled={busy} />
    </Screen>
  );
}
