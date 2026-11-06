import { BackHeader, Screen, T } from '../../../components/ui';

export default function PrivacyPolicy() {
  return (
    <Screen>
      <BackHeader title="Privacy Policy" />
      <T>[Work & Brew Privacy Policy goes here.]</T>
      <T style={{ marginTop: 14 }}>Last updated [date].</T>
    </Screen>
  );
}
