import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import Icon from './Icon';
import { Button } from './ui';

// Confirmation shown after a form is sent.
export default function Sent({ title, body, onAgain }) {
  return (
    <View style={s.box}>
      <View style={s.icon}><Icon name="check" size={26} color={colors.navy} strokeWidth={2.4} /></View>
      <Text style={s.t}>{title}</Text>
      <Text style={s.b}>{body}</Text>
      <Button title="Back to profile" variant="primary" style={{ alignSelf: 'stretch', marginTop: 22 }} onPress={() => router.back()} />
      {onAgain ? <Button title="Send another" style={{ alignSelf: 'stretch', marginTop: 10 }} onPress={onAgain} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { alignItems: 'center', marginTop: 30 },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.steel, alignItems: 'center', justifyContent: 'center' },
  t: { fontFamily: fonts.display, fontSize: 24, color: colors.text, marginTop: 18 },
  b: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 8 },
});
