// Café detail sheet.
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AmenityGrid } from '../../../../components/Amenities';
import CafePhoto from '../../../../components/CafePhoto';
import Icon from '../../../../components/Icon';
import MapSheet from '../../../../components/Sheet';
import { Button, Chip, CircleButton, T } from '../../../../components/ui';
import { getCafe } from '../../../../services';
import { useApp } from '../../../../state/AppState';
import { useFocusTimer } from '../../../../state/FocusTimer';
import { colors, fonts } from '../../../../theme';
import useLayout from '../../../../theme/useLayout';

export default function CafeDetail() {
  const { id } = useLocalSearchParams();
  const cafe = getCafe(id);
  const { isSaved, toggleSaved } = useApp();
  const timer = useFocusTimer();
  const { isSmall } = useLayout();

  if (!cafe) {
    return <MapSheet><T variant="h2">Café not found</T></MapSheet>;
  }
  const saved = isSaved(cafe.id);

  const directions = () => {
    const q = encodeURIComponent(`${cafe.name}, ${cafe.neighborhood}`);
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${cafe.lat},${cafe.lng}&q=${q}`
      : `https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`;
    Linking.openURL(url);
  };

  return (
    <MapSheet>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{cafe.name}</Text>
          <Text style={s.sub}>{cafe.neighborhood}, {cafe.borough} · {cafe.distanceMi} mi</Text>
        </View>
        <CircleButton icon="close" label="Close" size={52} onPress={() => (router.canGoBack() ? router.back() : router.replace('/map'))} />
      </View>
      <View style={s.chips}>
        <Chip label={`Open until ${cafe.openUntil}`} tone="steel" />
        {cafe.scoutVerified && <Chip label="Scout verified" tone="navy" icon="check" />}
        <Chip label={String(cafe.rating)} tone="surface" icon="star" />
      </View>
      <View style={s.gallery}>
        <CafePhoto cafe={cafe} index={0} style={s.big} />
        <View style={s.smallCol}>
          <CafePhoto cafe={cafe} index={1} style={s.small} />
          <CafePhoto cafe={cafe} index={2} style={s.small} mirror={cafe.art.mirror} />
        </View>
      </View>
      <View style={s.actions}>
        <Button title="Directions" icon={isSmall ? undefined : 'directions'} style={s.act} onPress={directions} />
        <Button title={isSmall ? 'Start' : 'Start session'} icon="timer" variant="primary" style={s.act}
          onPress={() => { timer.start(cafe.id); router.navigate('/focus'); }} />
        <CircleButton icon="bookmark" label={saved ? 'Remove from saved' : 'Save café'} size={48} active={saved} onPress={() => toggleSaved(cafe.id)} />
      </View>
      <AmenityGrid cafe={cafe} />
      <View style={s.why}>
        <Text style={s.whyK}>Why our scouts picked it</Text>
        <Text style={s.whyV}>{cafe.scoutNote}</Text>
      </View>
      <Pressable onPress={() => router.push({ pathname: '/profile/report', params: { cafe: cafe.name } })} style={{ marginTop: 16, alignSelf: 'center' }}>
        <Text style={s.report}>Something wrong? Report it</Text>
      </Pressable>
    </MapSheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 },
  name: { fontFamily: fonts.display, fontSize: 30, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 2 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  gallery: { flexDirection: 'row', gap: 4, height: 150, marginTop: 14, borderRadius: 12, overflow: 'hidden' },
  big: { flex: 2 },
  smallCol: { flex: 1, gap: 4 },
  small: { flex: 1 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center', marginVertical: 14 },
  act: { flex: 1, paddingHorizontal: 10 },
  why: { backgroundColor: colors.navy, borderRadius: 12, padding: 18, marginTop: 12 },
  whyK: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.steelInk },
  whyV: { fontFamily: fonts.displaySemi, fontSize: 17, lineHeight: 24, color: colors.softWhite, marginTop: 6 },
  report: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, textDecorationLine: 'underline' },
});
