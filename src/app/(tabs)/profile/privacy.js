import { useState } from 'react';
import { BackHeader, Button, Card, Screen, ToggleRow } from '../../../components/ui';
import { confirm, notify } from '../../../lib/alert';
import * as api from '../../../services';
import { useApp } from '../../../state/AppState';

export default function Privacy() {
  const { state, setPrivacy, resetAll } = useApp();
  const p = state.privacy;
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    await api.requestDataExport();
    setBusy(false);
    notify('Request received', "We'll email you a copy of your data within 30 days.");
  };

  const del = async () => {
    const ok = await confirm('Delete your account?', 'This removes your profile, saved cafés, and session history. It cannot be undone.', { confirmText: 'Delete', destructive: true });
    if (!ok) return;
    await api.deleteAccount();
    resetAll();
  };

  return (
    <Screen>
      <BackHeader title="Privacy and data" />
      <Card>
        <ToggleRow first title="Location while using the app" subtitle="Shows cafés near you" value={p.location} onChange={(v) => setPrivacy('location', v)} />
        <ToggleRow title="Share stats with friends" subtitle="Sessions and cafés visited" value={p.shareStats} onChange={(v) => setPrivacy('shareStats', v)} />
        <ToggleRow title="Personalized picks" subtitle="Uses your saved cafés" value={p.personalized} onChange={(v) => setPrivacy('personalized', v)} />
      </Card>
      <Button title="Download my data" style={{ marginTop: 16 }} onPress={download} disabled={busy} />
      <Button title="Delete my account" variant="danger" style={{ marginTop: 12 }} onPress={del} />
    </Screen>
  );
}
