// import { useEffect, useRef, useState } from 'react';
// import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
// import Svg, { Circle, Path } from 'react-native-svg';
// import { generateWavyCirclePath } from '../utils/wavyPath';
// import { Image } from 'react-native';
// type AppLoaderProps = {
//   progress: number; // 0-100, deterministic, stage-based (real boot events only)
//   statusText: string;
//   hasError?: boolean;
//   onRetry?: () => void;
// };

// const SIZE = 130;
// const STROKE_WIDTH = 6;
// const RADIUS = (SIZE - STROKE_WIDTH) / 2;
// const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // good-enough approximation for the wavy path too

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// // Precompute the wavy squiggle path once — shape itself is static,
// // only its rotation is animated (cheap, native-driver friendly).
// const WAVY_PATH_D = generateWavyCirclePath(
//   SIZE / 2,
//   SIZE / 2,
//   RADIUS - 2,
//   4.5, // amplitude — how "spiky" the wobble is
//   11, // frequency — how many bumps around the ring
//   72
// );

// export default function AppLoader({ progress, statusText, hasError, onRetry }: AppLoaderProps) {
//   const clamped = Math.max(0, Math.min(100, progress));

//   // Smoothly animate the progress arc instead of jumping between stages
//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const [displayPercent, setDisplayPercent] = useState(0);

//   useEffect(() => {
//     const listenerId = progressAnim.addListener(({ value }) => {
//       setDisplayPercent(Math.round(value));
//     });
//     return () => progressAnim.removeListener(listenerId);
//   }, [progressAnim]);

//   useEffect(() => {
//     Animated.timing(progressAnim, {
//       toValue: clamped,
//       duration: 450,
//       easing: Easing.out(Easing.cubic),
//       useNativeDriver: false, // SVG stroke props can't use native driver
//     }).start();
//   }, [clamped, progressAnim]);

//   const strokeDashoffset = progressAnim.interpolate({
//     inputRange: [0, 100],
//     outputRange: [CIRCUMFERENCE, 0],
//   });

//   // Continuous rotation for the wavy squiggle ring — purely decorative
//   // "still alive" motion, independent of the real progress value.
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     const loop = Animated.loop(
//       Animated.timing(rotateAnim, {
//         toValue: 1,
//         duration: 6500,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     );
//     loop.start();
//     return () => loop.stop();
//   }, [rotateAnim]);

//   const rotateInterpolate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   // Subtle breathing pulse on the center logo
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   useEffect(() => {
//     const loop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.06,
//           duration: 900,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 900,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     loop.start();
//     return () => loop.stop();
//   }, [pulseAnim]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.ringWrapper}>
//         {/* Background track + deterministic progress arc */}
//         <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
//           <Circle
//             cx={SIZE / 2}
//             cy={SIZE / 2}
//             r={RADIUS}
//             stroke="#e5e7eb"
//             strokeWidth={STROKE_WIDTH}
//             fill="none"
//           />
//           <AnimatedCircle
//             cx={SIZE / 2}
//             cy={SIZE / 2}
//             r={RADIUS}
//             stroke="#93c5fd"
//             strokeWidth={STROKE_WIDTH}
//             fill="none"
//             strokeDasharray={CIRCUMFERENCE}
//             strokeDashoffset={strokeDashoffset}
//             strokeLinecap="round"
//             rotation="-90"
//             origin={`${SIZE / 2}, ${SIZE / 2}`}
//           />
//         </Svg>

//         {/* Rotating wavy squiggle ring — decorative "alive" indicator */}
//         <Animated.View
//           style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotateInterpolate }] }]}
//         >
//           <Svg width={SIZE} height={SIZE}>
//             <Path
//               d={WAVY_PATH_D}
//               stroke={hasError ? '#f87171' : '#2563eb'}
//               strokeWidth={4}
//               fill="none"
//               strokeLinejoin="round"
//               strokeLinecap="round"
//               opacity={0.9}
//             />
//           </Svg>
//         </Animated.View>

//         {/* Center logo */}
//         <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
//           <Text style={styles.logoText}>CA</Text>
//         </Animated.View>
//       </View>

//       <Text style={[styles.statusText, hasError && styles.errorText]}>{statusText}</Text>
//       {!hasError && <Text style={styles.progressText}>{displayPercent}%</Text>}

//       {hasError && onRetry && (
//         <Pressable style={styles.retryButton} onPress={onRetry}>
//           <Text style={styles.retryText}>Try Again</Text>
//         </Pressable>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   ringWrapper: { width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' },
//   logoWrapper: {
//     width: SIZE - STROKE_WIDTH * 6,
//     height: SIZE - STROKE_WIDTH * 6,
//     borderRadius: (SIZE - STROKE_WIDTH * 6) / 2,
//     backgroundColor: '#eff6ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoText: { fontSize: 22, fontWeight: 'bold', color: '#2563eb' },
//   statusText: { marginTop: 22, fontSize: 14, color: '#6b7280' },
//   errorText: { color: '#dc2626', fontWeight: '600' },
//   progressText: { marginTop: 4, fontSize: 12, color: '#9ca3af' },
//   retryButton: {
//     marginTop: 16,
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 8,
//     backgroundColor: '#2563eb',
//   },
//   retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
// });













import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable, Image } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { generateWavyCirclePath } from '../utils/wavyPath';

type AppLoaderProps = {
  progress: number; // 0-100, deterministic, stage-based (real boot events only)
  statusText: string;
  hasError?: boolean;
  onRetry?: () => void;
  logoUrl?: string; // NEW — institute's own logo, falls back to "CA" placeholder if empty
};

const SIZE = 130;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // good-enough approximation for the wavy path too

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Precompute the wavy squiggle path once — shape itself is static,
// only its rotation is animated (cheap, native-driver friendly).
const WAVY_PATH_D = generateWavyCirclePath(
  SIZE / 2,
  SIZE / 2,
  RADIUS - 2,
  4.5, // amplitude — how "spiky" the wobble is
  11, // frequency — how many bumps around the ring
  72
);

export default function AppLoader({ progress, statusText, hasError, onRetry, logoUrl }: AppLoaderProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  // Smoothly animate the progress arc instead of jumping between stages
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const listenerId = progressAnim.addListener(({ value }) => {
      setDisplayPercent(Math.round(value));
    });
    return () => progressAnim.removeListener(listenerId);
  }, [progressAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clamped,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // SVG stroke props can't use native driver
    }).start();
  }, [clamped, progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  // Continuous rotation for the wavy squiggle ring — purely decorative
  // "still alive" motion, independent of the real progress value.
  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Subtle breathing pulse on the center logo
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.ringWrapper}>
        {/* Background track + deterministic progress arc */}
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#e5e7eb"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#93c5fd"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>

        {/* Rotating wavy squiggle ring — decorative "alive" indicator */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotateInterpolate }] }]}
        >
          <Svg width={SIZE} height={SIZE}>
            <Path
              d={WAVY_PATH_D}
              stroke={hasError ? '#f87171' : '#2563eb'}
              strokeWidth={4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.9}
            />
          </Svg>
        </Animated.View>

        {/* Center logo */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="cover" />
          ) : (
            <Text style={styles.logoText}>CA</Text>
          )}
        </Animated.View>
      </View>

      <Text style={[styles.statusText, hasError && styles.errorText]}>{statusText}</Text>
      {!hasError && <Text style={styles.progressText}>{displayPercent}%</Text>}

      {hasError && onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  ringWrapper: { width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' },
  logoWrapper: {
    width: SIZE - STROKE_WIDTH * 6,
    height: SIZE - STROKE_WIDTH * 6,
    borderRadius: (SIZE - STROKE_WIDTH * 6) / 2,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#2563eb' },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: (SIZE - STROKE_WIDTH * 6) / 2,
  },
  statusText: { marginTop: 22, fontSize: 14, color: '#6b7280' },
  errorText: { color: '#dc2626', fontWeight: '600' },
  progressText: { marginTop: 4, fontSize: 12, color: '#9ca3af' },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});