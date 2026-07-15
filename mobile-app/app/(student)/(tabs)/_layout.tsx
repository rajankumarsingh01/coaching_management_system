import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { CustomTabBar } from '../../../src/components/ui/CustomTabBar';

export default function StudentTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text> }}
      />
      <Tabs.Screen
        name="notes"
        options={{ title: 'Notes', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📄</Text> }}
      />
      <Tabs.Screen
        name="tests"
        options={{ title: 'Tests', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📝</Text> }}
      />
      <Tabs.Screen
        name="fees"
        options={{ title: 'Fees', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text> }}
      />
    </Tabs>
  );
}