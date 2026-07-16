import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomTabBar } from '../../../src/components/ui/CustomTabBar';

export default function ParentTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance', tabBarIcon: ({ color }) => <Ionicons name="checkmark-done-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="fees" options={{ title: 'Fees', tabBarIcon: ({ color }) => <Ionicons name="cash-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="homework" options={{ title: 'Homework', tabBarIcon: ({ color }) => <Ionicons name="clipboard-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={20} color={color} /> }} />
    </Tabs>
  );
}