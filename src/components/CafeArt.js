// Placeholder café illustration from the wireframe kit. Swap for real photos
// (e.g. Supabase Storage URLs) once they exist; see CafePhoto in ./CafePhoto.js.
import { useId } from 'react';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Circle, Stop } from 'react-native-svg';

export const PALETTES = {
  warm: { wall: '#3B3430', wall2: '#2A2320', ink: '#120C09', glass: '#9DB6CF' },
  slate: { wall: '#27313E', wall2: '#1D2530', ink: '#0D1219', glass: '#C9D8E8' },
  latte: { wall: '#4A4038', wall2: '#332B25', ink: '#160F0B', glass: '#90ADC9' },
};

export default function CafeArt({ palette = 'warm', mirror = false, plant = true, slice = true, style }) {
  const p = PALETTES[palette] || PALETTES.warm;
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const u = (k) => `url(#${k}${id})`;
  // Coordinates for the two compositions in the kit (window left or right).
  const L = mirror
    ? { win: 186, mull: 242, ray: 'M190 108 L294 108 L340 180 L160 180z', cords: 'M70 0v26M120 0v38', l1: 82, l2: 132,
        shades: 'M58 26h24l-4 10h-16zM108 38h24l-4 10h-16z', shadow: 100, counter: 40, box: 52, cups: [110, 128], pl: 296 }
    : { win: 24, mull: 80, ray: 'M28 108 L132 108 L178 180 L-2 180z', cords: 'M200 0v26M250 0v38', l1: 212, l2: 262,
        shades: 'M188 26h24l-4 10h-16zM238 38h24l-4 10h-16z', shadow: 230, counter: 170, box: 182, cups: [240, 258], pl: 304 };
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'} style={style}>
      <Defs>
        <LinearGradient id={`w${id}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={p.wall} /><Stop offset="1" stopColor={p.wall2} /></LinearGradient>
        <LinearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={p.wall2} /><Stop offset="1" stopColor={p.ink} stopOpacity=".35" /></LinearGradient>
        <LinearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#fff" stopOpacity=".55" /><Stop offset=".5" stopColor={p.glass} /><Stop offset="1" stopColor={p.glass} /></LinearGradient>
        <LinearGradient id={`r${id}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFF8E8" stopOpacity=".55" /><Stop offset="1" stopColor="#FFF8E8" stopOpacity="0" /></LinearGradient>
        <RadialGradient id={`l${id}`} cx=".5" cy="0" r=".9"><Stop offset="0" stopColor="#FFE7B8" stopOpacity=".9" /><Stop offset="1" stopColor="#FFE7B8" stopOpacity="0" /></RadialGradient>
      </Defs>
      <Rect width="320" height="180" fill={u('w')} />
      <Rect y="126" width="320" height="54" fill={u('f')} />
      <Path d="M0 126H320" stroke={p.ink} strokeOpacity=".18" />
      <Rect x={L.win} y="18" width="112" height="94" rx="8" fill={p.ink} opacity=".18" />
      <Rect x={L.win + 4} y="22" width="104" height="86" rx="6" fill={u('g')} />
      <Path d={`M${L.mull} 22v86M${L.win + 4} 64h104`} stroke={p.wall} strokeWidth="5" />
      <Path d={L.ray} fill={u('r')} />
      <G stroke={p.ink} strokeWidth="2"><Path d={L.cords} /></G>
      <Ellipse cx={L.l1} cy="44" rx="34" ry="24" fill={u('l')} />
      <Ellipse cx={L.l2} cy="56" rx="34" ry="24" fill={u('l')} />
      <Path d={L.shades} fill={p.ink} />
      <Ellipse cx={L.shadow} cy="134" rx="74" ry="8" fill={p.ink} opacity=".25" />
      <Rect x={L.counter} y="100" width="120" height="32" rx="4" fill={p.ink} />
      <Rect x={L.counter} y="100" width="120" height="5" rx="2" fill="#fff" opacity=".18" />
      <Rect x={L.box} y="78" width="34" height="22" rx="4" fill={p.ink} opacity=".9" />
      <Rect x={L.box + 4} y="82" width="12" height="6" rx="2" fill={p.glass} opacity=".8" />
      <Rect x={L.cups[0]} y="90" width="12" height="10" rx="2" fill={p.wall} />
      <Rect x={L.cups[1]} y="92" width="10" height="8" rx="2" fill={p.wall} />
      {plant && (
        <G>
          <Ellipse cx={L.pl} cy="144" rx="14" ry="4" fill={p.ink} opacity=".25" />
          <Circle cx={L.pl} cy="110" r="18" fill="#6F7F5E" opacity=".85" />
          <Circle cx={L.pl - 6} cy="104" r="8" fill="#8C9B78" opacity=".8" />
          <Rect x={L.pl - 8} y="120" width="16" height="24" rx="3" fill={p.ink} opacity=".75" />
        </G>
      )}
    </Svg>
  );
}
