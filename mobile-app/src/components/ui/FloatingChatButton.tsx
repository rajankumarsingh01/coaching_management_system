// src/components/ui/FloatingChatButton.tsx
//
// Reusable floating "Ask AI" bubble — sits above the tab bar, with a
// soft pulsing ring so the AI Tutor feels alive/discoverable instead of
// buried inside a menu. Mount once per (tabs)/_layout.tsx.

import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColors } from '../../theme/useThemeColors';
import { shadow } from '../../theme/tokens';

type FloatingChatButtonProps = {
  route?: string;
  bottomOffset?: number;
};

const SIZE = 56;

export function FloatingChatButton({ route = '/(student)/doubt-chat', bottomOffset = 70 }: FloatingChatButtonProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(route as any)}
      style={[styles.wrap, { bottom: bottomOffset + insets.bottom }]}
      accessibilityRole="button"
      accessibilityLabel="Ask AI Tutor"
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { backgroundColor: colors.primary, transform: [{ scale: ringScale }], opacity: ringOpacity }]}
      />
      <Animated.View style={[styles.button, { backgroundColor: colors.primary }, shadow.raised]}>
        <Ionicons name="sparkles" size={22} color={colors.onPrimary} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});