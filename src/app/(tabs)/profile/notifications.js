import { BackHeader, Card, Screen, ToggleRow } from '../../../components/ui';
import { useApp } from '../../../state/AppState';

export default function Notifications() {
  const { state, setNotification } = useApp();
  const n = state.notifications;
  return (
    <Screen>
      <BackHeader title="Notifications" />
      <Card>
        <ToggleRow first title="Push notifications" subtitle="Session reminders and new cafés" value={n.push} onChange={(v) => setNotification('push', v)} />
        <ToggleRow title="Email" subtitle="Account and launch updates" value={n.email} onChange={(v) => setNotification('email', v)} />
        <ToggleRow title="Weekly digest" subtitle="Your week in cafés, every Sunday" value={n.digest} onChange={(v) => setNotification('digest', v)} />
        <ToggleRow title="New cafés near me" subtitle="When scouts verify a spot nearby" value={n.nearby} onChange={(v) => setNotification('nearby', v)} />
      </Card>
    </Screen>
  );
}
