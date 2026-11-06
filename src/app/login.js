import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { Button } from '../components/ui';
import * as api from '../services';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';

export default function Login() {
  const { signIn } = useApp();
  const [busy, setBusy] = useState(false);

  // Placeholder: both buttons sign in locally until Supabase Auth is connected.
  const go = (fn) => async () => {
    setBusy(true);
    try { await fn(); signIn(); } finally { setBusy(false); }
  };

  return (
    <View style={s.page}>
      <View style={s.logo}><Icon name="cup" size={30} color={colors.navy} strokeWidth={2} /></View>
      <Text style={s.title}>Work & Brew</Text>
      <Text style={s.sub}>Vetted cafés for getting work done in NYC.</Text>
      <Button title="Log in" variant="light" size="lg" style={s.btn} onPress={go(api.signIn)} disabled={busy} />
      <Button title="Create an account" variant="ghost" size="lg" style={s.btn} onPress={go(api.signUp)} disabled={busy} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  logo: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.softWhite, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.displaySemi, fontSize: 38, color: colors.softWhite, marginTop: 26 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.steelInk, marginTop: 8, marginBottom: 30, textAlign: 'center' },
  btn: { alignSelf: 'stretch', marginTop: 10, maxWidth: 420, width: '100%' },
});
