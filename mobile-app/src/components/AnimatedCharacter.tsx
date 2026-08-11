// src/components/AnimatedCharacter.tsx
//
// Login screen ka onboarding character.
// - idle/thinking/success/error: seedha Lottie JSON swap
// - entry: walk-cycle lottie (jisme character khud bag/briefcase le ke
//   chal raha hai) ko RN Animated se left→center translate karte hain,
//   khatam hone pe parent ko onFinish() call karke batate hain.

import { memo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

export type CharacterState = 'entry' | 'idle' | 'thinking' | 'success' | 'error';

const SOURCES: Record<Exclude<CharacterState, 'entry'>, any> = {
  idle: require('../../assets/lottie/character-idle.json'),
  thinking: require('../../assets/lottie/character-thinking.json'),
  success: require('../../assets/lottie/character-success.json'),
  error: require('../../assets/lottie/character-error.json'),
};

// Walking-with-bag lottie — character khud briefcase/bag carry karta hai,
// isliye alag se briefcase draw karne ki zaroorat nahi.
const WALK_SOURCE = require('../../assets/lottie/character-walk.json');

const LOOPING_STATES: CharacterState[] = ['idle', 'thinking'];

type Props = {
  state: CharacterState;
  size?: number;
  // sirf 'entry' state ke liye — walk-in khatam hote hi call hota hai,
  // taaki parent (login.tsx) form ko fade-in kar sake.
  onFinish?: () => void;
};

function AnimatedCharacterBase({ state, size = 180, onFinish }: Props) {
  const lottieRef = useRef<LottieView>(null);
  const translateX = useRef(new Animated.Value(-size)).current;
  const [walking, setWalking] = useState(true);

  useEffect(() => {
    if (state !== 'entry') {
      lottieRef.current?.reset();
      lottieRef.current?.play();
      return;
    }
    // Entry sequence: off-screen (left) se chal ke center tak aao, phir
    // thoda ruk ke parent ko batao khatam ho gaya.
    setWalking(true);
    translateX.setValue(-size);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setWalking(false);
      setTimeout(() => onFinish?.(), 350);
    });
  }, [state]);

  if (state === 'entry') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          <LottieView
            ref={lottieRef}
            source={WALK_SOURCE}
            autoPlay
            loop={walking}
            style={{ width: size * 0.75, height: size * 0.75 }}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        ref={lottieRef}
        source={SOURCES[state]}
        autoPlay
        loop={LOOPING_STATES.includes(state)}
        style={{ width: size, height: size }}
      />
    </View>
  );
}

// memo: sirf `state`/`size` badalne pe re-render, parent (LoginScreen) ke
// baaki re-renders (email/password typing) ignore honge.
export const AnimatedCharacter = memo(AnimatedCharacterBase);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
});