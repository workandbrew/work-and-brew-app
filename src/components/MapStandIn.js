// Stand-in for the real map (MapTiler, per the kit). Draws a stylized street grid
// and places pins by projecting each café's lat/lng into the visible area.
// To go live: replace with a MapLibre/MapTiler view and keep the same props.
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import Icon from './Icon';

const Streets = memo(function Streets() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
      <Rect width="390" height="844" fill="#1C2433" />
      <Path d="M300 0 C340 200 330 420 390 560 L390 0Z M260 844 C300 720 360 680 390 640 L390 844Z" fill="#17284A" />
      <Rect x="20" y="300" width="140" height="120" rx="8" fill="#22362E" />
      <Rect x="200" y="560" width="90" height="80" rx="8" fill="#22362E" />
      {[...Array(9)].map((_, i) => (
        <Rect key={`b${i}`} x={18 + (i % 3) * 120} y={460 + Math.floor(i / 3) * 140} width="80" height="60" rx="6" fill="#232C3B" />
      ))}
      <Path d="M0 390 L390 350 M0 520 L390 500 M0 660 L390 630 M0 790 L390 770 M0 250 L390 220" stroke="#2C3546" strokeWidth="9" />
      <Path d="M70 0 L110 844 M180 0 L190 844 M280 0 L250 844 M360 0 L330 844" stroke="#2C3546" strokeWidth="7" />
      <Path d="M0 600 L390 420" stroke="#333D50" strokeWidth="12" />
    </Svg>
  );
});

export function project(cafes, box) {
  // box: { x, y, w, h } in px where pins may appear.
  if (!cafes.length) return [];
  const lats = cafes.map((c) => c.lat);
  const lngs = cafes.map((c) => c.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;
  return cafes.map((c) => ({
    cafe: c,
    x: box.x + (cafes.length === 1 ? box.w / 2 : ((c.lng - minLng) / spanLng) * box.w),
    y: box.y + (cafes.length === 1 ? box.h / 2 : ((maxLat - c.lat) / spanLat) * box.h),
  }));
}

export default function MapStandIn({ pins = [], selectedId, onSelect, dim, style }) {
  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <Streets />
      {pins.map(({ cafe, x, y }) => {
        const sel = cafe.id === selectedId;
        const size = sel ? 46 : 30;
        return (
          <Pressable key={cafe.id} onPress={() => onSelect?.(cafe)} accessibilityLabel={cafe.name} hitSlop={10}
            style={[st.pin, { left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2 },
              sel && { backgroundColor: '#2B1A12', borderWidth: 3 }]}>
            <Icon name="cup" size={sel ? 20 : 14} color="#fff" strokeWidth={2} />
          </Pressable>
        );
      })}
      {dim ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} /> : null}
    </View>
  );
}

const st = StyleSheet.create({
  pin: { position: 'absolute', backgroundColor: '#17274E', borderWidth: 2.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#17274E', shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
});
