import { useWindowDimensions } from 'react-native';
import { MAX_CONTENT, space } from './index';

export default function useLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isSmall = width < 360; // iPhone SE (1st gen) and similar
  const gutter = width > MAX_CONTENT + space.page * 2 ? (width - MAX_CONTENT) / 2 : isSmall ? 16 : space.page;
  return { width, height, isTablet, isSmall, gutter, contentWidth: Math.min(width - gutter * 2, MAX_CONTENT) };
}
