import { router, useLocalSearchParams } from 'expo-router';
import { BackHeader, CafeRow, Screen, T } from '../../../components/ui';
import { filterCafes, useApp } from '../../../state/AppState';

export default function CafesList() {
  const { hood } = useLocalSearchParams();
  const { state } = useApp();
  const cafes = filterCafes(state.filters, { neighborhood: hood });
  const n = cafes.length;
  return (
    <Screen>
      <BackHeader title="Cafés here" />
      <T variant="muted" style={{ marginBottom: 14 }}>
        {n} café{n === 1 ? '' : 's'} in {hood || 'NYC'}{state.filters.length ? `, ${state.filters.length} filter${state.filters.length === 1 ? '' : 's'} on` : ''}. Sample list shown.
      </T>
      {cafes.map((c) => <CafeRow key={c.id} cafe={c} onPress={() => router.push(`/map/cafe/${c.id}`)} />)}
    </Screen>
  );
}
