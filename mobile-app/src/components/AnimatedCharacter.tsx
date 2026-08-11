// src/components/AnimatedCharacter.tsx
//
// Login screen ka onboarding character — 4 states (idle/thinking/success/error)
// ke beech simple JSON-swap se transition karta hai. Rive jaisa single-file
// state-machine nahi hai, lekin setup/maintenance dono simple hai aur Expo
// managed workflow + Expo Go dono me chalta hai.
//
// React.memo lagaya hai taaki jab form ke text inputs re-render ho (typing),
// ye component unnecessarily re-render na ho — sirf `state` prop change hone
// pe hi re-render/re-animate hoga.

import { memo, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export type CharacterState = 'idle' | 'thinking' | 'success' | 'error';

// NOTE: Ye 4 JSON files khud download karke yahan daalni hain — is file me
// koi animation data nahi hai, sirf wiring hai. Neeche wale message me
// bataya hai konsa file kahan se milega.
const SOURCES: Record<CharacterState, any> = {
  idle: require('../../assets/lottie/character-idle.json'),
  thinking: require('../../assets/lottie/character-thinking.json'),
  success: require('../../assets/lottie/character-success.json'),
  error: require('../../assets/lottie/character-error.json'),
};

// success/error ek baar play ho ke ruk jaate hain (loop=false); idle/thinking
// continuously loop karte hain jab tak state change na ho.
const LOOPING_STATES: CharacterState[] = ['idle', 'thinking'];

type Props = {
  state: CharacterState;
  size?: number;
};

function AnimatedCharacterBase({ state, size = 180 }: Props) {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    // State badalte hi animation ko shuru se play karo (especially
    // success/error ke liye zaroori hai, warna purani frame pe atka reh
    // sakta hai).
    ref.current?.reset();
    ref.current?.play();
  }, [state]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        ref={ref}
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