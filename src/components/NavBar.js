// Floating pill nav from the wireframe. Tap a tab, or slide across and let go.
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import Icon from './Icon';

const TABS = {
  explore: { label: 'Explore', icon: 'compass' },
  map: { label: 'Map', icon: 'map' },
  focus: { label: 'Focus', icon: 'timer' },
  saved: { label: 'Saved', icon: 'bookmark' },
  profile: { label: 'Profile', icon: 'user' },
};

export default function NavBar({ state, emitter, navigateToTab }) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => TABS[r.name]);
  const [hover, setHover] = useState(null);
  const barX = useRef(0);
  const barRef = useRef(null);
  const tabX = useRef([]); // [{ x, w }] relative to the bar
  const hoverRef = useRef(null);

  const go = (route, focused) => {
    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (event.defaultPrevented) return;
    // Tapping the current tab returns to its first screen.
    if (focused) router.navigate(`/${route.name}`);
    else navigateToTab(route.key);
  };

  const indexAt = (x) => {
    const tabs = tabX.current;
    let best = 0;
    let dist = Infinity;
    tabs.forEach((t, i) => {
      if (!t) return;
      const d = Math.abs(x - (t.x + t.w / 2));
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: (_, g) => {
        barRef.current?.measureInWindow?.((x) => { barX.current = x; });
        hoverRef.current = indexAt(g.x0 - barX.current);
        setHover(hoverRef.current);
      },
      onPanResponderMove: (_, g) => {
        const i = indexAt(g.moveX - barX.current);
        if (i !== hoverRef.current) { hoverRef.current = i; setHover(i); }
      },
      onPanResponderRelease: () => {
        const i = hoverRef.current;
        hoverRef.current = null;
        setHover(null);
        if (i != null) navRef.current(i);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => { hoverRef.current = null; setHover(null); },
    })
  ).current;

  // Keep the latest routes/state available to the pan handler.
  const navRef = useRef();
  navRef.current = (i) => {
    const r = routes[i];
    if (r) go(r, state.routes[state.index].key === r.key);
  };

  return (
    <View pointerEvents="box-none" style={[st.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View ref={barRef} style={st.bar} {...pan.panHandlers}
        onLayout={() => barRef.current?.measureInWindow?.((x) => { barX.current = x; })}>
        {routes.map((route, i) => {
          const focused = state.routes[state.index].key === route.key;
          const meta = TABS[route.name];
          const isHover = hover === i && !focused;
          return (
            <Pressable key={route.key} onPress={() => go(route, focused)} accessibilityRole="tab" accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onLayout={(e) => { const { x, width: w } = e.nativeEvent.layout; tabX.current[i] = { x, w }; }}
              style={[st.tab, focused && st.tabOn, isHover && st.tabHover]}>
              <Icon name={meta.icon} size={25} color={focused ? colors.navBar : colors.navText} />
              <Text style={[st.label, focused && st.labelOn]} numberOfLines={1}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  bar: { width: '100%', maxWidth: 420, height: 96, borderRadius: 48, backgroundColor: colors.navBar, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  tab: { flex: 1, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', gap: 5 },
  tabOn: { flexGrow: 0, flexBasis: 100, width: 100, backgroundColor: colors.navActive },
  tabHover: { backgroundColor: colors.navHover },
  label: { fontFamily: fonts.nav, fontSize: 14, color: colors.navText },
  labelOn: { color: colors.navBar, fontWeight: '700', fontSize: 16 },
});
