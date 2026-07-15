// src/components/ui/CustomTabBar.tsx
//
// Shared bottom tab bar — har role (admin/teacher/student/parent) ka
// (tabs)/_layout.tsx isi ek component ko reuse karega via:
//   <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
//
// Icons emoji-based hain (StatCard.tsx me jo pattern already hai wahi) —
// koi @expo/vector-icons ya third-party icon lib add nahi ki, minimal-deps
// rule ke hisaab se.
//
// Props ka shape React Navigation ke bottom-tabs custom `tabBar` render
// prop jaisa hi hai (state/descriptors/navigation) — yahan `any` use kiya
// hai taaki agar @react-navigation/bottom-tabs types directly resolve na
// ho (package.json me sirf expo-router ho) to bhi build na toote.

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, radius, typography } from '../../theme/tokens';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];

        // Screen apne Tabs.Screen options={{ title, tabBarIcon }} me dono
        // define karega — is component ko sirf render karna hai
        const label = (options.title ?? route.name) as string;
        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                isFocused && { backgroundColor: colors.primaryMuted },
              ]}
            >
              {options.tabBarIcon
                ? options.tabBarIcon({ focused: isFocused, color, size: 20 })
                : null}
            </View>
            <Text
              style={[typography.caption, { color }, styles.label]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 40,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 2,
  },
});