import { useState } from 'react';
import { BackHeader, Button, Field, Label, Screen, Select, T } from '../../../components/ui';
import Sent from '../../../components/Sent';
import { INQUIRY_TOPICS } from '../../../data/cafes';
import { notify } from '../../../lib/alert';
import * as api from '../../../services';

const EMPTY = { name: '', email: '', topic: INQUIRY_TOPICS[0], message: '' };
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export default function Business() {
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const send = async () => {
    if (!f.name.trim() || !validEmail(f.email) || !f.message.trim())
      return notify('A few details missing', 'Add your name, a valid email, and a message.');
    setBusy(true);
    try { await api.submitInquiry(f); setSent(true); } finally { setBusy(false); }
  };

  return (
    <Screen>
      <BackHeader title="Business inquiries" />
      {sent ? (
        <Sent title="Message sent" body="Thanks for reaching out. We will reply within 2 business days." onAgain={() => { setF(EMPTY); setSent(false); }} />
      ) : (
        <>
          <T>Café owner, brand, or press? Tell us a little and we will reply within 2 business days.</T>
          <Label>Your name</Label>
          <Field value={f.name} onChangeText={set('name')} placeholder="Full name" autoComplete="name" />
          <Label>Email</Label>
          <Field value={f.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Label>Topic</Label>
          <Select label="Topic" value={f.topic} options={INQUIRY_TOPICS} onChange={set('topic')} />
          <Label>Message</Label>
          <Field multiline value={f.message} onChangeText={set('message')} placeholder="How can we help?" />
          <Button title={busy ? 'Sending…' : 'Send message'} variant="primary" size="lg" style={{ marginTop: 20 }} onPress={send} disabled={busy} />
        </>
      )}
    </Screen>
  );
}
