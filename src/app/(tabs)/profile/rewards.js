import { StyleSheet, Text, View } from 'react-native';
import { BackHeader, Button, Chip, Screen } from '../../../components/ui';
import { useApp } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';

export default function Rewards() {
  const { state, joinWaitlist } = useApp();
  const on = state.waitlists.rewards;
  return (
    <Screen>
      <BackHeader title="Café Rewards" />
      <View style={s.card}>
        <Chip label="Coming soon" tone="steel" />
        <Text style={s.t}>Earn perks for working local</Text>
        <Text style={s.b}>Visit partner cafés, log focus sessions, and unlock rewards like free drinks and member events.</Text>
      </View>
      <Button title={on ? "You're on the list" : 'Notify me at launch'} icon={on ? 'check' : undefined} variant={on ? 'outline' : 'primary'} size="lg"
        style={{ marginTop: 16 }} onPress={() => joinWaitlist('rewards')} />
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.navy, borderRadius: 22, padding: 24 },
  t: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: colors.softWhite, marginTop: 14 },
  b: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.steelInk, marginTop: 10 },
});
