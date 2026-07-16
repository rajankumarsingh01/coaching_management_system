import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomTabBar } from '../../../src/components/ui/CustomTabBar';

export default function SuperAdminTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Institutes', tabBarIcon: ({ color }) => <Ionicons name="business-outline" size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="onboard"
        options={{ title: 'Onboard', tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={20} color={color} /> }}
      />
    </Tabs>
  );
}