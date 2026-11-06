// Bottom sheet that sits over the map (café detail, filters).
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, MAX_CONTENT, NAV_CLEARANCE } from '../theme';
import useLayout from '../theme/useLayout';
import MapStandIn from './MapStandIn';

export default function MapSheet({ children, top = 110, footer, scrollRef }) {
  const insets = useSafeAreaInsets();
  const { isSmall } = useLayout();
  const px = isSmall ? 16 : 20;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MapStandIn dim />
      <Pressable style={{ height: insets.top + top - 30 }} onPress={() => router.back()} accessibilityLabel="Close" />
      <View style={s.sheet}>
        <View style={s.grab} />
        <ScrollView ref={scrollRef} contentContainerStyle={{ paddingHorizontal: px, paddingTop: 4, paddingBottom: NAV_CLEARANCE + insets.bottom + (footer ? 80 : 0) }} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {footer ? <View style={[s.footer, { left: px, right: px, bottom: NAV_CLEARANCE + insets.bottom - 14 }]}>{footer}</View> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: { flex: 1, width: '100%', maxWidth: MAX_CONTENT, alignSelf: 'center', backgroundColor: colors.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: -10 } },
  grab: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#5A4E47', alignSelf: 'center', marginTop: 9, marginBottom: 10 },
  footer: { position: 'absolute' },
});
