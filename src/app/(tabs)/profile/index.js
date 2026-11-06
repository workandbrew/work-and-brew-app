import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Avatar from '../../../components/Avatar';
import Icon from '../../../components/Icon';
import { Button, Card, Chip, LinkRow, PageTitle, Screen, SectionHead } from '../../../components/ui';
import { confirm } from '../../../lib/alert';
import * as api from '../../../services';
import { formatMinutes, useApp, useStats } from '../../../state/AppState';
import { colors, fonts } from '../../../theme';

export default function Profile() {
  const { state, signOut } = useApp();
  const p = state.profile;
  const stats = useStats();

  const logout = async () => {
    if (!(await confirm('Log out?', 'You can log back in any time.', { confirmText: 'Log out' }))) return;
    await api.signOut();
    signOut();
  };

  return (
    <Screen>
      <PageTitle kicker="Your account" title="Profile" />
      <View style={s.member}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 330 226" preserveAspectRatio="xMaxYMax slice">
          {[110, 85, 60].map((r) => <Circle key={r} cx={250} cy={165} r={r} stroke="rgba(144,173,201,0.18)" strokeWidth={16} fill="none" />)}
        </Svg>
        <View style={s.mTop}>
          <Text style={s.mK}>Work & Brew member</Text>
          <Icon name="cup" size={22} color={colors.softWhite} />
        </View>
        <View style={s.mName}>
          <Avatar name={p.name} uri={p.photoUri} size={58} />
          <Text style={s.name} numberOfLines={1}>{p.name}</Text>
        </View>
        <View style={s.mRow}>
          <Text style={s.mSub}>{p.borough}{'\n'}Member since {p.memberSince}</Text>
          <Text style={s.mNo}>No. {p.memberNo}</Text>
        </View>
      </View>

      <Card style={s.stats}>
        <Stat n={stats.sessions} label="sessions" />
        <Stat n={stats.cafesVisited} label="cafés visited" line />
        <Stat n={formatMinutes(stats.avgMinutes)} label="avg session" line />
      </Card>

      <Card style={s.about}>
        <View style={s.aboutHead}>
          <Text style={s.aboutT}>About you</Text>
          <Pressable onPress={() => router.push('/profile/edit')}><Text style={s.link}>Edit</Text></Pressable>
        </View>
        <Text style={s.aboutBody}>{p.about || 'Add a line about how you like to work.'}</Text>
        <View style={s.tags}>{p.intents.map((i) => <Chip key={i} label={i} tone="surface" />)}</View>
      </Card>

      <Pressable style={s.rewards} onPress={() => router.push('/profile/rewards')}>
        <View style={s.gift}><Icon name="gift" size={22} color={colors.navy} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.rT}>Café Rewards</Text>
          <Text style={s.rS}>Earn perks at partner cafés</Text>
        </View>
        <Chip label="Coming soon" tone="steel" />
      </Pressable>

      <SectionHead title="Settings" />
      <Card>
        <LinkRow first icon="user" title="Edit profile" subtitle="Name, borough, preferences" onPress={() => router.push('/profile/edit')} />
        <LinkRow icon="bell" title="Notifications" subtitle="Push, email, weekly digest" onPress={() => router.push('/profile/notifications')} />
        <LinkRow icon="lock" title="Privacy and data" subtitle="Control your info" onPress={() => router.push('/profile/privacy')} />
        <LinkRow icon="briefcase" title="Business inquiries" subtitle="Contact Work & Brew" onPress={() => router.push('/profile/business')} />
        <LinkRow icon="bug" title="Report an issue" subtitle="Bugs or wrong café info" onPress={() => router.push('/profile/report')} />
      </Card>
      <Button title="Log out" icon="logout" style={{ marginTop: 18 }} onPress={logout} />
      <View style={s.legal}>
        <Pressable onPress={() => router.push('/profile/terms')}><Text style={s.link}>Terms</Text></Pressable>
        <Pressable onPress={() => router.push('/profile/privacy-policy')}><Text style={s.link}>Privacy Policy</Text></Pressable>
      </View>
    </Screen>
  );
}

function Stat({ n, label, line }) {
  return (
    <View style={[s.stat, line && { borderLeftWidth: 1, borderLeftColor: colors.line }]}>
      <Text style={s.statN}>{n}</Text>
      <Text style={s.statL}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  member: { height: 226, borderRadius: 22, backgroundColor: colors.navy, padding: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  mTop: { flexDirection: 'row', justifyContent: 'space-between' },
  mK: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.steelInk },
  mName: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  name: { fontFamily: fonts.displaySemi, fontSize: 40, color: colors.softWhite, flex: 1 },
  mRow: { position: 'absolute', left: 22, right: 22, bottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  mSub: { flex: 1, marginRight: 10, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.steelInk },
  mNo: { fontFamily: fonts.bold, fontSize: 17, color: colors.softWhite },
  stats: { flexDirection: 'row', marginTop: 12, paddingVertical: 14, paddingHorizontal: 2 },
  stat: { flex: 1, paddingHorizontal: 14 },
  statN: { fontFamily: fonts.bold, fontSize: 21, color: colors.text },
  statL: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  about: { marginTop: 12, padding: 16 },
  aboutHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aboutT: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  aboutBody: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21, color: colors.text, marginTop: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  link: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.muted, textDecorationLine: 'underline', padding: 4 },
  rewards: { marginTop: 12, backgroundColor: colors.surface2, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  gift: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.steel, alignItems: 'center', justifyContent: 'center' },
  rT: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  rS: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 18 },
});
