import { Tabs } from 'expo-router';
import NavBar from '../../components/NavBar';

export const unstable_settings = { initialRouteName: 'explore' };
import { colors } from '../../theme';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <NavBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="focus" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
