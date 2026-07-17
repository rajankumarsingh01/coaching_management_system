import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomTabBar } from '../../../src/components/ui/CustomTabBar';
import { FloatingChatButton } from '../../../src/components/ui/FloatingChatButton';

export default function StudentTabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={20} color={color} /> }} />
        <Tabs.Screen name="notes" options={{ title: 'Notes', tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={20} color={color} /> }} />
        <Tabs.Screen name="tests" options={{ title: 'Tests', tabBarIcon: ({ color }) => <Ionicons name="create-outline" size={20} color={color} /> }} />
        <Tabs.Screen name="fees" options={{ title: 'Fees', tabBarIcon: ({ color }) => <Ionicons name="cash-outline" size={20} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={20} color={color} /> }} />
      </Tabs>
      <FloatingChatButton />
    </View>
  );
}