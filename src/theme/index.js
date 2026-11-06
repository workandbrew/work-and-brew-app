// Design tokens from the Spotlight wireframe kit (design-tokens.json).
import { Platform } from 'react-native';

export const colors = {
  bg: '#0E0907',
  surface: '#1A1310',
  surface2: '#241B16',
  text: '#F4EEE7',
  muted: '#A99C92',
  line: 'rgba(255,255,255,0.08)',
  navy: '#17274E',
  steel: '#90ADC9',
  steelInk: '#C9D8E8',
  slate: '#27313E',
  beige: '#4A3F37',
  walletBeige: '#3A2E27',
  cream: '#2A201B',
  softWhite: '#F8F6F1',
  primary: '#F4EEE7',
  onPrimary: '#120C09',
  espresso: '#2B1A12',
  chrome: '#A5ABB0',
  navBar: '#0E0602',
  navActive: '#F8F5EE',
  navHover: '#2E1F16',
  navText: '#E9DFD3',
  focusBreak: '#2F4A3D',
  danger: '#C24A4A',
};

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displaySemi: 'PlayfairDisplay_600SemiBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  black: 'Inter_800ExtraBold',
  // Nav labels use Times New Roman per the kit; Android falls back to its system serif.
  nav: Platform.select({ ios: 'Times New Roman', android: 'serif', default: '"Times New Roman", Times, serif' }),
};

export const type = {
  heroTitle: 56,
  pageTitle: 30,
  section: 19,
  body: 15,
  small: 12.5,
  timerLarge: 104,
  timerSmall: 46,
};

export const radius = { card: 8, chip: 8, button: 24, sheet: 26, nav: 48, panel: 18 };

export const space = { page: 20, section: 24, navHeight: 96, navBottom: 16 };

// Room to leave at the bottom of scrolling pages so content clears the floating nav.
export const NAV_CLEARANCE = 130;

// Responsive helpers. Phones use the full width with a 20px gutter; on tablets
// and wide windows content sits in a centered column so lines stay readable.
export const MAX_CONTENT = 680;
