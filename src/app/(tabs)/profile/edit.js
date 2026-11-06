import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Avatar from '../../../components/Avatar';
import { BackHeader, Button, Field, Label, PillGroup, Screen, Select } from '../../../components/ui';
import { BOROUGHS, INTENTS, NEEDS } from '../../../data/cafes';
import { notify } from '../../../lib/alert';
import { useApp } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';

const MAX_ABOUT = 150;

export default function EditProfile() {
  const { state, updateProfile } = useApp();
  const [p, setP] = useState(state.profile);
  const set = (k) => (v) => setP((x) => ({ ...x, [k]: v }));
  const toggleIn = (k) => (v) => setP((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((i) => i !== v) : [...x[k], v] }));

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled && res.assets?.[0]) set('photoUri')(res.assets[0].uri);
  };

  const save = () => {
    if (!p.name.trim()) return notify('Name needed', 'Add your name so we know what to call you.');
    updateProfile({ ...p, name: p.name.trim() });
    router.back();
  };

  return (
    <Screen>
      <BackHeader title="Edit profile" />
      <View style={{ alignItems: 'center' }}>
        <Avatar name={p.name} uri={p.photoUri} size={98} tone="dark" />
        <Button title={p.photoUri ? 'Change photo' : 'Add a photo'} icon="plus" size="sm" style={{ marginTop: 14, height: 46, paddingHorizontal: 20 }} onPress={pickPhoto} />
      </View>

      <Label>Name</Label>
      <Field value={p.name} onChangeText={set('name')} placeholder="Your name" autoComplete="name" />

      <Label>About you</Label>
      <Field multiline value={p.about} maxLength={MAX_ABOUT} onChangeText={set('about')} placeholder="A line or two about how you like to work" />
      <Text style={{ alignSelf: 'flex-end', fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6 }}>{p.about.length}/{MAX_ABOUT}</Text>

      <Label>I go to cafés to</Label>
      <PillGroup options={INTENTS} selected={p.intents} onToggle={toggleIn('intents')} />

      <Label>School (optional)</Label>
      <Field value={p.school} onChangeText={set('school')} placeholder="Your school or university" />

      <Label>Borough</Label>
      <Select label="Borough" value={p.borough} options={BOROUGHS} onChange={set('borough')} />

      <Label>What you need most</Label>
      <PillGroup options={NEEDS} selected={p.needs} onToggle={toggleIn('needs')} />

      <Button title="Save changes" variant="primary" size="lg" style={{ marginTop: 28 }} onPress={save} />
    </Screen>
  );
}
