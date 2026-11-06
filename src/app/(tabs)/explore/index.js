import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CafeArt from '../../../components/CafeArt';
import CafePhoto from '../../../components/CafePhoto';
import Icon from '../../../components/Icon';
import { Button, SectionHead } from '../../../components/ui';
import { getCafe, getFeature, listCafes } from '../../../services';
import { imageSource } from '../../../data/images';
import { formatMinutes, useApp, useStats } from '../../../state/AppState';
import { colors, fonts, NAV_CLEARANCE } from '../../../theme';
import useLayout from '../../../theme/useLayout';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { gutter, height, isTablet, isSmall } = useLayout();
  const heroH = Math.round(Math.min(isTablet ? 620 : 540, Math.max(420, height * 0.64)));
  const { state, isSaved, toggleSaved } = useApp();
  const feature = getFeature();
  const cafe = getCafe(feature.cafeId);
  const onList = isSaved(cafe.id);

  const top = useMemo(() => [...listCafes()].sort((a, b) => a.distanceMi - b.distanceMi).slice(0, 4), []);
  const savedCafe = state.saved.length ? getCafe(state.saved[state.saved.length - 1].cafeId) : null;
  const because = savedCafe ? listCafes().filter((c) => !isSaved(c.id)) : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: NAV_CLEARANCE + insets.bottom }} showsVerticalScrollIndicator={false}>
      {/* Spotlight hero */}
      <View style={[s.hero, { height: heroH }]}>
        {feature.photo ? (
          <Image source={imageSource(feature.photo)} style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} resizeMode="cover" accessibilityLabel={`${cafe.name} storefront`} />
        ) : (
          <View style={s.heroArt}><CafeArt palette={cafe.art.palette} mirror={cafe.art.mirror} plant={false} /></View>
        )}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1 1">
          <Defs>
            <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.bg} stopOpacity=".55" />
              <Stop offset=".25" stopColor={colors.bg} stopOpacity="0" />
              <Stop offset=".5" stopColor={colors.bg} stopOpacity=".2" />
              <Stop offset=".96" stopColor={colors.bg} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="1" height="1" fill="url(#fade)" />
        </Svg>
        <View style={[s.topbar, { top: insets.top + 8, left: gutter, right: gutter - 8 }]}>
          <View style={s.logo}>
            <Icon name="cup" size={22} color="#fff" strokeWidth={2} />
            <Text style={s.logoText}>Work & Brew</Text>
          </View>
          <View style={s.logo}>
            <Pressable onPress={() => router.push('/map/search')} accessibilityLabel="Search" style={s.iconBtn}>
              <Icon name="search" size={22} color="#fff" />
            </Pressable>
            <Pressable onPress={() => router.navigate('/profile')} accessibilityLabel="Profile" style={s.avatar}>
              {state.profile.photoUri ? <Image source={imageSource(state.profile.photoUri)} style={s.avatarImg} /> : <Text style={s.avatarText}>{state.profile.name.slice(0, 1).toUpperCase()}</Text>}
            </Pressable>
          </View>
        </View>
        <View style={[s.copy, { left: gutter, right: gutter }]}>
          <Text style={s.tag}>Café of the week</Text>
          <Text style={[s.heroTitle, isSmall && { fontSize: 46, lineHeight: 54 }]} numberOfLines={1} adjustsFontSizeToFit>{cafe.name}</Text>
          <View style={s.tags}>
            <Text style={s.tagsText}>{cafe.highlights.join(' · ')} · </Text>
            <Icon name="star" size={11} color="#D8CFC6" />
            <Text style={s.tagsText}> {cafe.rating}</Text>
          </View>
          <View style={s.heroBtns}>
            <Button title="Read feature" icon={isSmall ? undefined : 'play'} variant="light" style={{ flex: 1, paddingHorizontal: isSmall ? 10 : 18 }} onPress={() => router.push('/explore/feature')} />
            <Button title={onList ? 'On my list' : 'My list'} icon={isSmall ? undefined : onList ? 'check' : 'plus'} variant="ghost" style={{ flex: 1, paddingHorizontal: isSmall ? 10 : 18 }}
              onPress={() => toggleSaved(cafe.id)} />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: gutter }}>
        <SectionHead title="Your wallet" hint="Tap to bring forward" style={{ marginTop: 10 }} />
        <Wallet />
        <View style={s.row2}>
          <Button title="Begin session" icon={isSmall ? undefined : 'timer'} style={{ flex: 1, paddingHorizontal: isSmall ? 10 : 18 }} onPress={() => router.navigate('/focus')} />
          <Button title="Café map" icon={isSmall ? undefined : 'map'} style={{ flex: 1, paddingHorizontal: isSmall ? 10 : 18 }} onPress={() => router.navigate('/map')} />
        </View>
      </View>

      <SectionHead title="Top 4 near you today" style={{ paddingHorizontal: gutter }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: gutter, gap: 8 }}>
        {top.map((c, i) => (
          <Pressable key={c.id} onPress={() => router.push(`/map/cafe/${c.id}`)} accessibilityLabel={`${i + 1}. ${c.name}`} style={s.top10}>
            <Svg width={120} height={170} style={s.topNum}>
              <SvgText x={0} y={160} fontFamily={fonts.black} fontSize={120} letterSpacing={-8}
                fill={colors.bg} stroke="#8C7F75" strokeWidth={2}>{String(i + 1)}</SvgText>
            </Svg>
            <CafePhoto cafe={c} style={s.poster} />
          </Pressable>
        ))}
      </ScrollView>

      {because.length > 0 && (
        <>
          <SectionHead title={`Because you saved ${savedCafe.name}`} style={{ paddingHorizontal: gutter }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: gutter, gap: 12 }}>
            {because.map((c, i) => (
              <Pressable key={c.id} onPress={() => router.push(`/map/cafe/${c.id}`)} style={{ width: 180 }}>
                <CafePhoto cafe={c} index={i} style={{ height: 100, borderRadius: 6 }} />
                <Text style={s.landName}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

// Three stacked cards; tapping one brings it to the front.
function Wallet() {
  const { state } = useApp();
  const stats = useStats();
  const last = state.visits[0];
  const lastCafe = last ? getCafe(last.cafeId) : null;
  const nearby = [...listCafes()].filter((c) => c.id !== lastCafe?.id).sort((a, b) => a.distanceMi - b.distanceMi)[0];

  const cards = {
    last: {
      bg: colors.walletBeige, fg: colors.text, label: 'Last visited', right: lastCafe ? lastCafe.name.split(' ')[0] : '—',
      title: lastCafe ? lastCafe.name : 'No visits yet',
      sub: lastCafe ? `${lastCafe.neighborhood}${last.at ? '' : ', yesterday'} for ${formatMinutes(last.minutes)}` : 'Start a session at a café to log it',
      onPress: lastCafe ? () => router.push(`/map/cafe/${lastCafe.id}`) : null,
    },
    near: {
      bg: colors.steel, fg: colors.navy, label: 'Nearby right now', right: `${nearby.distanceMi} mi`,
      title: nearby.name, sub: `${nearby.neighborhood}, ${nearby.distanceMi} mi, open now`,
      onPress: () => router.push(`/map/cafe/${nearby.id}`),
    },
    week: {
      bg: colors.slate, fg: colors.softWhite, label: 'Your week', right: `${stats.weekHours}h`,
      title: `${stats.weekSessions} session${stats.weekSessions === 1 ? '' : 's'}, ${stats.weekHours}h focused`,
      sub: `${stats.tasksDoneThisWeek} task${stats.tasksDoneThisWeek === 1 ? '' : 's'} done since Monday`,
      onPress: () => router.navigate('/focus'),
    },
  };
  const [order, setOrder] = useState(['last', 'near', 'week']); // last item is in front

  const bring = (k) => {
    if (order[2] === k) return cards[k].onPress?.();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOrder([...order.filter((x) => x !== k), k]);
  };

  return (
    <View style={s.stack}>
      {order.map((k, i) => {
        const c = cards[k];
        const front = i === 2;
        return (
          <Pressable key={k} onPress={() => bring(k)} accessibilityRole="button" accessibilityLabel={`${c.label}: ${c.title}`}
            style={[s.wcard, { backgroundColor: c.bg, top: i * 44, zIndex: i + 1, transform: [{ scale: front ? 1 : 0.97 }] }]}>
            <View style={s.wl}><Text style={[s.wlText, { color: c.fg }]}>{c.label}</Text><Text style={[s.wlText, { color: c.fg }]}>{c.right}</Text></View>
            <Text style={[s.wv, { color: c.fg }]} numberOfLines={1}>{c.title}</Text>
            <Text style={[s.ws, { color: c.fg }]} numberOfLines={1}>{c.sub}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  hero: { overflow: 'hidden' },
  heroArt: { ...StyleSheet.absoluteFillObject, transform: [{ scale: 1.25 }] },
  topbar: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontFamily: fonts.black, fontSize: 17, color: '#fff', letterSpacing: -0.3 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 34, height: 34, borderRadius: 17 },
  avatarText: { fontFamily: fonts.bold, fontSize: 14, color: colors.softWhite },
  copy: { position: 'absolute', bottom: 18, alignItems: 'center' },
  tag: { fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 0.7, color: colors.steel },
  heroTitle: { fontFamily: fonts.display, fontSize: 56, lineHeight: 64, color: '#fff', marginTop: 6, letterSpacing: -1 },
  tags: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  tagsText: { fontFamily: fonts.regular, fontSize: 13, color: '#D8CFC6' },
  heroBtns: { flexDirection: 'row', gap: 10, marginTop: 18, maxWidth: 520, width: '100%', alignSelf: 'center' },
  row2: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stack: { height: 212 },
  wcard: { position: 'absolute', left: 0, right: 0, height: 124, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 18, shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: -6 }, elevation: 4 },
  wl: { flexDirection: 'row', justifyContent: 'space-between', opacity: 0.85 },
  wlText: { fontFamily: fonts.semibold, fontSize: 12.5 },
  wv: { fontFamily: fonts.bold, fontSize: 18, marginTop: 22, letterSpacing: -0.3 },
  ws: { fontFamily: fonts.regular, fontSize: 13, opacity: 0.8, marginTop: 3 },
  top10: { width: 150, height: 170 },
  topNum: { position: 'absolute', left: -2, top: 6 },
  poster: { position: 'absolute', right: 0, top: 0, width: 104, height: 150, borderRadius: 6 },
  landName: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.text, marginTop: 8 },
});
