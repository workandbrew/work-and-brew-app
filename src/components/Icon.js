// Line icons lifted from the wireframe kit (24x24, 1.8 stroke).
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const P = (d, extra) => ({ t: 'p', d, ...extra });
const C = (cx, cy, r) => ({ t: 'c', cx, cy, r });
const R = (x, y, width, height, rx) => ({ t: 'r', x, y, width, height, rx });

const ICONS = {
  cup: [P('M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3')],
  search: [C(11, 11, 7), P('M20 20l-4-4')],
  star: [P('M12 3l2.7 5.6 6.2.9-4.5 4.4 1 6.1L12 17.1 6.6 20l1-6.1L3.1 9.5l6.2-.9z', { fill: true, noStroke: true })],
  play: [P('M7 4l13 8-13 8z', { fill: true })],
  plus: [P('M12 5v14M5 12h14')],
  timer: [C(12, 13, 8), P('M12 9v4l2.5 2M10 2h4')],
  map: [P('M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14')],
  compass: [C(12, 12, 9), P('M15.5 8.5l-2 5-5 2 2-5z')],
  bookmark: [P('M6 3h12v18l-6-5-6 5z')],
  user: [C(12, 8, 4), P('M4 21c1-4 4.5-6 8-6s7 2 8 6')],
  back: [P('M15 6l-6 6 6 6')],
  chevron: [P('M9 6l6 6-6 6')],
  up: [P('M6 15l6-6 6 6')],
  shield: [P('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'), P('M9 12l2 2 4-4')],
  plug: [P('M9 2v6M15 2v6M7 8h10v4a5 5 0 0 1-10 0zM12 17v5')],
  seat: [P('M6 10V5h12v5M4 10h16v4H4zM6 14v6M18 14v6')],
  laptop: [P('M4 5h16v11H4zM2 19h20')],
  filters: [P('M4 6h16M7 12h10M10 18h4')],
  pin: [P('M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z'), C(12, 9, 2.5)],
  quiet: [P('M11 5L6 9H3v6h3l5 4zM15.5 9.5a4 4 0 0 1 0 5')],
  moon: [P('M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z')],
  food: [P('M4 11h16a8 8 0 0 1-16 0zM8 4v4M12 3v5M16 4v4')],
  locate: [C(12, 12, 3), C(12, 12, 8), P('M12 1v3M12 20v3M1 12h3M20 12h3')],
  list: [P('M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01')],
  close: [P('M6 6l12 12M18 6L6 18')],
  check: [P('M5 12l5 5 9-10')],
  directions: [P('M3 11l18-8-8 18-2-8z')],
  restroom: [P('M5 3h14v18H5zM12 3v18')],
  sun: [C(12, 12, 4), P('M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5')],
  pause: [P('M8 5v14M16 5v14')],
  gift: [P('M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3-5-1s3 1 5 1zM12 7c1.5-3 5-3 5-1s-3 1-5 1z')],
  bell: [P('M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4')],
  lock: [R(5, 11, 14, 10, 2), P('M8 11V7a4 4 0 0 1 8 0v4')],
  briefcase: [R(3, 7, 18, 13, 2), P('M9 7V5h6v2M3 13h18')],
  bug: [P('M12 20a6 6 0 0 1-6-6v-3a6 6 0 0 1 12 0v3a6 6 0 0 1-6 6zM12 11v9M4 13h2M18 13h2M5 7l2 2M19 7l-2 2')],
  logout: [P('M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11')],
  slide: [P('M9 7l-5 5 5 5M15 7l5 5-5 5')],
  chevronDown: [P('M6 9l6 6 6-6')],
};

export default function Icon({ name, size = 22, color = '#F4EEE7', strokeWidth = 1.8 }) {
  const shapes = ICONS[name];
  if (!shapes) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {shapes.map((s, i) => {
        if (s.t === 'c') return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} />;
        if (s.t === 'r') return <Rect key={i} x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} />;
        return <Path key={i} d={s.d} fill={s.fill ? color : 'none'} stroke={s.noStroke ? 'none' : color} />;
      })}
    </Svg>
  );
}
