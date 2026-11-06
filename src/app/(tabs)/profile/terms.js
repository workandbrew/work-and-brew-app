import { BackHeader, Screen, T } from '../../../components/ui';

export default function Terms() {
  return (
    <Screen>
      <BackHeader title="Terms" />
      <T>[Work & Brew Terms and Conditions go here.]</T>
      <T style={{ marginTop: 14 }}>Last updated [date].</T>
    </Screen>
  );
}
