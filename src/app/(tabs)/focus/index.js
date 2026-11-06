import { useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../components/Icon';
import { Button, CircleButton, SectionHead } from '../../../components/ui';
import { QUADRANTS } from '../../../data/cafes';
import { getCafe } from '../../../services';
import { confirm } from '../../../lib/alert';
import { useApp } from '../../../state/AppState';
import { SESSIONS, formatClock, useFocusTimer } from '../../../state/FocusTimer';
import { colors, fonts, NAV_CLEARANCE } from '../../../theme';
import useLayout from '../../../theme/useLayout';

const qColor = Object.fromEntries(QUADRANTS.map((q) => [q.key, q]));

export default function Focus() {
  const insets = useSafeAreaInsets();
  const { gutter, isSmall, isTablet } = useLayout();
  const { state, addTask, toggleTask, cycleQuadrant, removeTask } = useApp();
  const timer = useFocusTimer();
  const [expanded, setExpanded] = useState(false);

  const open = state.tasks.filter((t) => !t.done);
  const current = open[0];
  const label = timer.phase === 'break' ? 'Break. Stretch, refill, look away.' : current ? current.text : 'Pick a task below';
  const cafe = timer.cafeId ? getCafe(timer.cafeId) : null;
  const isBreak = timer.phase === 'break';
  const panelBg = isBreak ? colors.focusBreak : colors.navy;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((x) => !x);
  };
  const playPause = () => (timer.running ? timer.pause() : timer.start());
  const kicker = `${isBreak ? 'Break after session' : 'Session'} ${timer.session} of ${SESSIONS}${cafe ? ` · at ${cafe.name}` : ''}`;

  const taskMenu = async (t) => {
    if (await confirm('Delete task?', t.text, { confirmText: 'Delete', destructive: true })) removeTask(t.id);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: NAV_CLEARANCE + insets.bottom, paddingTop: expanded ? 0 : insets.top + 14 }}>
      {expanded ? (
        <View style={[s.big, { backgroundColor: panelBg, paddingTop: insets.top + 16, paddingHorizontal: gutter }]}>
          <View style={s.bigTop}>
            <View style={s.dots}>
              {Array.from({ length: SESSIONS }).map((_, i) => (
                <View key={i} style={[s.dot, i < timer.session && { backgroundColor: colors.steel }]} />
              ))}
            </View>
            <CircleButton icon="up" label="Collapse timer" size={52} style={s.collapse} onPress={toggleExpanded} />
          </View>
          <Text style={s.bigKicker}>{kicker}</Text>
          <Pressable onLongPress={timer.skip} delayLongPress={700} accessibilityHint="Hold to skip to the next phase">
            <Text style={[s.bigClock, isSmall && { fontSize: 84, lineHeight: 100 }, isTablet && { fontSize: 140, lineHeight: 160 }]}>{formatClock(timer.left)}</Text>
          </Pressable>
          <Progress value={timer.progress} />
          <Text style={s.bigLabel} numberOfLines={2}>{label}</Text>
          <View style={s.bigBtns}>
            <Button title={timer.running ? 'Pause' : 'Start'} icon={timer.running ? 'pause' : 'play'} variant="light" style={{ flex: 1 }} onPress={playPause} />
            <Button title="Reset" variant="ghost" style={{ flex: 1 }} onPress={timer.reset} />
          </View>
          <Text style={s.hold}>Hold the clock to skip to your {isBreak ? 'next session' : 'break'}.</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: gutter }}>
          <Text style={s.kicker}>{kicker}</Text>
          <Text style={s.title}>Focus</Text>
          <Pressable onPress={toggleExpanded} accessibilityHint="Expands the timer" style={[s.mini, { backgroundColor: panelBg }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.miniClock}>{formatClock(timer.left)}</Text>
              <Text style={s.miniLabel} numberOfLines={1}>{label}. Tap to expand.</Text>
              <Progress value={timer.progress} />
            </View>
            <Pressable onPress={playPause} style={s.playBtn} accessibilityLabel={timer.running ? 'Pause' : 'Start'}>
              <Icon name={timer.running ? 'pause' : 'play'} size={22} color={colors.navy} />
            </Pressable>
          </Pressable>
        </View>
      )}

      <View style={{ paddingHorizontal: gutter }}>
        <BrainDump onSave={addTask} />

        {!expanded && (
          <View style={s.quads}>
            {QUADRANTS.map((q) => (
              <View key={q.key} style={{ flex: 1 }}>
                <View style={[s.qBar, { backgroundColor: q.dashed ? 'transparent' : q.color }, q.dashed && s.qDashed]} />
                <Text style={s.qNum}>{open.filter((t) => t.quadrant === q.key).length}</Text>
                <Text style={s.qLabel}>{q.label}</Text>
              </View>
            ))}
          </View>
        )}

        <SectionHead title={expanded ? 'Up next' : 'To do'} hint={expanded ? null : 'Tap to check off'} />
        {(expanded ? open.slice(1) : state.tasks).map((t) => (
          <Pressable key={t.id} onPress={() => toggleTask(t.id)} onLongPress={() => taskMenu(t)} style={s.task}
            accessibilityRole="checkbox" accessibilityState={{ checked: t.done }}>
            <View style={[s.box, t.done && s.boxDone]}>{t.done ? <Icon name="check" size={14} color="#fff" strokeWidth={2.4} /> : null}</View>
            <Text style={[s.txt, t.done && s.txtDone]}>{t.text}</Text>
            {!expanded && t.id === current?.id && !isBreak && <View style={s.now}><Text style={s.nowText}>Now</Text></View>}
            {!expanded && (
              <Pressable onPress={() => cycleQuadrant(t.id)} hitSlop={12} accessibilityLabel={`Priority: ${qColor[t.quadrant].label}. Tap to change.`}>
                <View style={[s.q, { backgroundColor: qColor[t.quadrant].dashed ? 'transparent' : qColor[t.quadrant].color }, qColor[t.quadrant].dashed && s.qDot]} />
              </Pressable>
            )}
          </Pressable>
        ))}
        {!state.tasks.length && <Text style={s.empty}>Nothing here yet. Brain dump a task above.</Text>}
        {!expanded && state.tasks.length > 0 && <Text style={s.tip}>Tap a dot to change priority. Long press a task to delete it.</Text>}
      </View>
    </ScrollView>
  );
}

function Progress({ value }) {
  return (
    <View style={s.prog}><View style={[s.progFill, { width: `${Math.min(100, Math.max(0, value * 100))}%` }]} /></View>
  );
}

function BrainDump({ onSave }) {
  const [text, setText] = useState('');
  const save = () => {
    const v = text.trim();
    if (!v) return;
    onSave(v);
    setText('');
  };
  return (
    <View style={s.dump}>
      <Icon name="plus" size={20} color={colors.navy} />
      <TextInput value={text} onChangeText={setText} onSubmitEditing={save} returnKeyType="done" blurOnSubmit={false}
        placeholder="Brain dump. Type it, forget it." placeholderTextColor="rgba(23,39,78,0.7)" style={s.dumpInput} selectionColor={colors.navy} />
      <Pressable onPress={save} style={s.dumpBtn} accessibilityRole="button"><Text style={s.dumpBtnText}>Save</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  kicker: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text },
  mini: { marginTop: 14, borderRadius: 22, paddingVertical: 18, paddingLeft: 22, paddingRight: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  miniClock: { fontFamily: fonts.displaySemi, fontSize: 46, lineHeight: 54, color: colors.softWhite, fontVariant: ['tabular-nums'] },
  miniLabel: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.steelInk },
  playBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.softWhite, alignItems: 'center', justifyContent: 'center' },
  prog: { height: 4, borderRadius: 2, backgroundColor: 'rgba(144,173,201,0.25)', marginTop: 12, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: colors.steel },
  big: { paddingBottom: 24, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  bigTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 22, height: 6, borderRadius: 3, backgroundColor: 'rgba(144,173,201,0.35)' },
  collapse: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)' },
  bigKicker: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.steelInk, marginTop: 10 },
  bigClock: { fontFamily: fonts.display, fontSize: 104, lineHeight: 120, color: colors.softWhite, letterSpacing: -3, fontVariant: ['tabular-nums'] },
  bigLabel: { fontFamily: fonts.semibold, fontSize: 18, color: colors.softWhite, marginTop: 14 },
  bigBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  hold: { fontFamily: fonts.regular, fontSize: 13, color: colors.steelInk, marginTop: 10 },
  dump: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 28, backgroundColor: colors.steel, paddingLeft: 18, paddingRight: 6 },
  dumpInput: { flex: 1, minWidth: 0, fontFamily: fonts.semibold, fontSize: 15, color: colors.navy, height: '100%', outlineStyle: 'none' },
  dumpBtn: { height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: colors.navy, justifyContent: 'center' },
  dumpBtnText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.softWhite },
  quads: { flexDirection: 'row', gap: 10, marginTop: 20 },
  qBar: { height: 3, borderRadius: 2 },
  qDashed: { borderTopWidth: 3, borderStyle: 'dashed', borderColor: '#5C4A3E', height: 0 },
  qNum: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginTop: 10 },
  qLabel: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
  task: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: colors.line },
  box: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.75, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  boxDone: { backgroundColor: colors.navy, borderColor: colors.navy },
  txt: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  txtDone: { color: colors.muted, textDecorationLine: 'line-through' },
  now: { backgroundColor: colors.steelInk, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  nowText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.navy },
  q: { width: 9, height: 9, borderRadius: 5 },
  qDot: { borderWidth: 1.5, borderColor: '#5C4A3E', borderStyle: 'dashed' },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 12 },
  tip: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 12 },
});
