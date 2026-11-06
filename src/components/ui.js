// Shared building blocks styled to the Spotlight wireframe.
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, MAX_CONTENT, NAV_CLEARANCE, radius } from '../theme';
import useLayout from '../theme/useLayout';
import CafePhoto from './CafePhoto';
import Icon from './Icon';

export function T({ style, variant = 'body', ...p }) {
  return <Text {...p} style={[t[variant], style]} />;
}

// Scrolling page with safe-area top padding and room for the floating nav.
export function Screen({ children, scroll = true, style, contentStyle, padTop = true, ...p }) {
  const insets = useSafeAreaInsets();
  const { gutter } = useLayout();
  const pad = { paddingTop: padTop ? insets.top + 14 : 0, paddingBottom: NAV_CLEARANCE + insets.bottom, paddingHorizontal: gutter };
  if (!scroll) return <View style={[s.screen, pad, style]}>{children}</View>;
  return (
    <ScrollView style={[s.screen, style]} contentContainerStyle={[pad, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} {...p}>
      {children}
    </ScrollView>
  );
}

export function PageTitle({ kicker, title }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {kicker ? <T variant="kicker">{kicker}</T> : null}
      <T variant="title">{title}</T>
    </View>
  );
}

export function BackHeader({ title, onBack }) {
  return (
    <View style={s.backHeader}>
      <CircleButton icon="back" label="Go back" onPress={onBack || (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      <T variant="title" style={{ fontSize: 28 }} numberOfLines={1}>{title}</T>
    </View>
  );
}

export function CircleButton({ icon, onPress, label, size = 46, active, style, iconSize = 20 }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6}
      style={({ pressed }) => [s.circle, { width: size, height: size, borderRadius: size / 2 },
        active && { backgroundColor: colors.navy, borderColor: colors.navy }, pressed && { opacity: 0.7 }, style]}>
      <Icon name={icon} size={iconSize} color={colors.text} />
    </Pressable>
  );
}

// variant: 'primary' (cream fill), 'outline', 'ghost' (on navy), 'danger'
export function Button({ title, icon, onPress, variant = 'outline', style, textStyle, disabled, size = 'md' }) {
  const v = btn[variant];
  const h = size === 'lg' ? 56 : size === 'sm' ? 38 : 48;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled}
      style={({ pressed }) => [s.btn, { height: h, borderRadius: h / 2 }, v.box, (pressed || disabled) && { opacity: disabled ? 0.45 : 0.8 }, style]}>
      {icon ? <Icon name={icon} size={18} color={v.text.color} /> : null}
      <Text style={[s.btnText, size === 'sm' && { fontSize: 14 }, v.text, textStyle]} numberOfLines={1}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, tone = 'cream', icon }) {
  const bg = { cream: colors.cream, steel: colors.steel, navy: colors.navy, surface: colors.surface2 }[tone];
  const fg = tone === 'steel' ? colors.navy : tone === 'navy' ? colors.softWhite : colors.text;
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text style={[s.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// Selectable pill used for filters and preferences.
export function Pill({ label, icon, on, onPress, style }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!on }} onPress={onPress}
      style={({ pressed }) => [s.pill, on && s.pillOn, pressed && { opacity: 0.8 }, style]}>
      {icon ? <Icon name={icon} size={16} color={on ? colors.onPrimary : colors.text} /> : null}
      <Text style={[s.pillText, on && { color: colors.onPrimary, fontFamily: fonts.semibold }]}>{label}</Text>
    </Pressable>
  );
}

export function PillGroup({ options, selected, onToggle }) {
  return (
    <View style={s.wrap}>
      {options.map((o) => {
        const key = typeof o === 'string' ? o : o.key;
        const label = typeof o === 'string' ? o : o.label;
        return <Pill key={key} label={label} icon={o.icon} on={selected.includes(key)} onPress={() => onToggle(key)} />;
      })}
    </View>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <View style={[s.seg, style]}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={[s.segBtn, on && { backgroundColor: colors.primary }]}>
            <Text style={[s.segText, on && { color: colors.onPrimary, fontFamily: fonts.semibold }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange, label }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onChange(!value)}
      style={[s.toggle, { backgroundColor: value ? colors.steel : '#4A3F37' }]} hitSlop={8}>
      <View style={[s.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function ToggleRow({ title, subtitle, value, onChange, first }) {
  return (
    <View style={[s.row, !first && s.rowLine]}>
      <View style={{ flex: 1 }}>
        <T variant="rowTitle">{title}</T>
        {subtitle ? <T variant="rowSub">{subtitle}</T> : null}
      </View>
      <Toggle value={value} onChange={onChange} label={title} />
    </View>
  );
}

export function LinkRow({ icon, title, subtitle, onPress, first }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.row, !first && s.rowLine, pressed && { backgroundColor: colors.surface2 }]}>
      <View style={s.rowIcon}><Icon name={icon} size={19} color={colors.text} /></View>
      <View style={{ flex: 1 }}>
        <T variant="rowTitle">{title}</T>
        {subtitle ? <T variant="rowSub">{subtitle}</T> : null}
      </View>
      <Icon name="chevron" size={18} color={colors.text} />
    </Pressable>
  );
}

export function Label({ children, style }) {
  return <T variant="label" style={[{ marginTop: 18, marginBottom: 8 }, style]}>{children}</T>;
}

export function Field({ multiline, style, ...p }) {
  return (
    <TextInput placeholderTextColor="#6F6560" selectionColor={colors.steel} multiline={multiline}
      style={[s.field, multiline && { height: 112, paddingTop: 14, textAlignVertical: 'top' }, style]} {...p} />
  );
}

// Dropdown that opens a bottom sheet of options (no native <select> on mobile).
export function Select({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={label} style={[s.field, s.select]}>
        <Text style={s.fieldText}>{value}</Text>
        <Icon name="chevronDown" size={18} color={colors.text} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)} />
        <View style={s.selectSheet}>
          <View style={s.grab} />
          {label ? <T variant="h2" style={{ marginBottom: 8 }}>{label}</T> : null}
          {options.map((o) => (
            <Pressable key={o} onPress={() => { onChange(o); setOpen(false); }} style={[s.row, s.rowLine, { paddingHorizontal: 4 }]}>
              <T variant="rowTitle" style={{ flex: 1 }}>{o}</T>
              {o === value ? <Icon name="check" size={18} color={colors.steel} /> : null}
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}

export function CafeRow({ cafe, onPress, right, subtitle }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={cafe.name}
      style={({ pressed }) => [s.cafeRow, pressed && { backgroundColor: colors.surface2 }]}>
      <CafePhoto cafe={cafe} style={s.thumb} />
      <View style={{ flex: 1 }}>
        <T variant="rowTitle" style={{ fontSize: 16 }}>{cafe.name}</T>
        <T variant="rowSub">{subtitle || `${cafe.neighborhood} · ${cafe.distanceMi} mi · Open until ${cafe.openUntil}`}</T>
      </View>
      {right !== undefined ? right : <Icon name="chevron" size={18} color={colors.text} />}
    </Pressable>
  );
}

export function SectionHead({ title, hint, style }) {
  return (
    <View style={[s.sechead, style]}>
      <T variant="h2">{title}</T>
      {hint ? <T variant="hint">{hint}</T> : null}
    </View>
  );
}

const t = StyleSheet.create({
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  kicker: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.text, letterSpacing: -0.5 },
  h2: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  rowSub: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 17, color: colors.muted, marginTop: 2 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
});

const btn = {
  primary: { box: { backgroundColor: colors.primary, borderColor: colors.primary }, text: { color: colors.onPrimary } },
  outline: { box: { backgroundColor: colors.surface, borderColor: colors.text }, text: { color: colors.text } },
  ghost: { box: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.3)' }, text: { color: '#fff' } },
  light: { box: { backgroundColor: colors.softWhite, borderColor: colors.softWhite }, text: { color: colors.onPrimary } },
  danger: { box: { backgroundColor: colors.surface, borderColor: colors.danger }, text: { color: colors.danger } },
};

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  circle: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, borderWidth: 1 },
  btnText: { fontFamily: fonts.semibold, fontSize: 15 },
  chip: { height: 26, paddingHorizontal: 9, borderRadius: radius.chip, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  chipText: { fontFamily: fonts.semibold, fontSize: 12 },
  pill: { height: 38, paddingHorizontal: 14, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.text },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seg: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 22, padding: 4, gap: 4 },
  segBtn: { flex: 1, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.text },
  toggle: { width: 50, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.panel, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 16 },
  rowLine: { borderTopWidth: 1, borderTopColor: colors.line },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  field: { minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 15, fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  fieldText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, flex: 1 },
  select: { flexDirection: 'row', alignItems: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  selectSheet: { width: '100%', maxWidth: MAX_CONTENT, alignSelf: 'center', backgroundColor: colors.bg, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: 20, paddingBottom: 40 },
  grab: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#4A3F37', alignSelf: 'center', marginBottom: 14 },
  cafeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.panel, marginBottom: 10 },
  thumb: { width: 60, height: 60, borderRadius: 8 },
  sechead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26, marginBottom: 12 },
});
