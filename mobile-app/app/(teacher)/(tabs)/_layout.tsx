import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomTabBar } from '../../../src/components/ui/CustomTabBar';

export default function TeacherTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance', tabBarIcon: ({ color }) => <Ionicons name="checkmark-done-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="fees" options={{ title: 'Fees', tabBarIcon: ({ color }) => <Ionicons name="cash-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={20} color={color} /> }} />
    </Tabs>
  );
}