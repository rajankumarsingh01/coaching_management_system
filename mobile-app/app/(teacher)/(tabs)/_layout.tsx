import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { CustomTabBar } from '../../../src/components/ui/CustomTabBar';

export default function TeacherTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text> }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text> }} />
      <Tabs.Screen name="fees" options={{ title: 'Fees', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚙️</Text> }} />
    </Tabs>
  );
}
