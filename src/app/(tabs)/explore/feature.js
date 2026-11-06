// Café of the Week article.
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CafeArt from '../../../components/CafeArt';
import { AmenityGrid } from '../../../components/Amenities';
import { Button, Chip, CircleButton } from '../../../components/ui';
import { imageSource } from '../../../data/images';
import { getCafe, getFeature } from '../../../services';
import { useFocusTimer } from '../../../state/FocusTimer';
import { colors, fonts, NAV_CLEARANCE } from '../../../theme';
import useLayout from '../../../theme/useLayout';

export default function Feature() {
  const insets = useSafeAreaInsets();
  const { gutter, width } = useLayout();
  const f = getFeature();
  const cafe = getCafe(f.cafeId);
  const timer = useFocusTimer();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: NAV_CLEARANCE + insets.bottom }} showsVerticalScrollIndicator={false}>
      <View style={[s.art, { height: Math.round(Math.min(460, Math.max(260, width * 0.75))) }]}>
        {f.headerPhoto || f.photo ? <Image source={imageSource(f.headerPhoto || f.photo)} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={`${cafe.name} storefront`} /> : <CafeArt palette="slate" mirror />}
        <CircleButton icon="back" label="Go back" style={[s.back, { top: insets.top + 6, left: gutter - 4 }]} onPress={() => router.back()} />
      </View>
      <View style={[s.body, { paddingHorizontal: gutter }]}>
        <Chip label={f.label} tone="steel" />
        <Text style={s.title}>{cafe.name}</Text>
        <Text style={s.headline}>{f.headline}</Text>
        <View style={s.byline}>
          <View style={s.av}><Text style={s.avText}>W</Text></View>
          <View>
            <Text style={s.by}>{f.author}</Text>
            <Text style={s.bySub}>{cafe.neighborhood}, {cafe.borough} · {f.readMinutes} min read</Text>
          </View>
        </View>
        <Text style={s.h2}>The space</Text>
        <Text style={s.p}>{f.space}</Text>
        <View style={s.quote}><Text style={s.quoteText}>{f.pullQuote}</Text></View>
        <Text style={s.h2}>Working here</Text>
        <AmenityGrid cafe={cafe} limit={4} />
        <Text style={s.h2}>What to order</Text>
        <Text style={s.p}>{f.order}</Text>
        {f.orderPhoto ? (
          <Image source={imageSource(f.orderPhoto)} style={s.orderImg} resizeMode="cover" accessibilityLabel={`What to order at ${cafe.name}`} />
        ) : null}
        <View style={s.btns}>
          <Button title="See on map" icon="map" style={{ flex: 1 }} onPress={() => router.push(`/map/cafe/${cafe.id}`)} />
          <Button title="Work here" icon="timer" variant="primary" style={{ flex: 1 }}
            onPress={() => { timer.start(cafe.id); router.navigate('/focus'); }} />
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  art: {},
  back: { position: 'absolute', backgroundColor: 'rgba(14,9,7,0.85)' },
  body: { marginTop: -30, backgroundColor: colors.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 24 },
  title: { fontFamily: fonts.display, fontSize: 46, lineHeight: 54, color: colors.text, marginTop: 14 },
  headline: { fontFamily: fonts.displaySemi, fontSize: 17, lineHeight: 26, color: colors.text, opacity: 0.92 },
  byline: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
  av: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avText: { fontFamily: fonts.bold, fontSize: 12, color: colors.softWhite },
  by: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  bySub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  h2: { fontFamily: fonts.display, fontSize: 21, color: colors.text, marginTop: 24, marginBottom: 8 },
  p: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 25, color: colors.text },
  quote: { borderLeftWidth: 3, borderLeftColor: colors.steel, paddingLeft: 18, marginTop: 22 },
  quoteText: { fontFamily: fonts.displaySemi, fontSize: 19, lineHeight: 27, color: colors.text },
  orderImg: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, marginTop: 14 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 22 },
});
