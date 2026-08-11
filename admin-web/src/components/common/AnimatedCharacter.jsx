// src/components/common/AnimatedCharacter.jsx
//
// Login screen ka onboarding character (web version — mobile-app ke
// AnimatedCharacter.tsx jaisa hi state machine, bas RN Animated ki jagah
// CSS transition use ho raha hai kyunki ye browser me chalta hai).
//
// - idle/thinking/success/error: seedha Lottie JSON swap
// - entry: walk-cycle lottie ko CSS transform transition se left→center
//   translate karte hain, khatam hone pe parent ko onFinish() batate hain.

import { useEffect, useState, memo } from 'react';
import Lottie from 'lottie-react';
import idleAnim from '../../assets/lottie/character-idle.json';
import thinkingAnim from '../../assets/lottie/character-thinking.json';
import successAnim from '../../assets/lottie/character-success.json';
import errorAnim from '../../assets/lottie/character-error.json';
import walkAnim from '../../assets/lottie/character-walk.json';

const SOURCES = {
  idle: idleAnim,
  thinking: thinkingAnim,
  success: successAnim,
  error: errorAnim,
};

const LOOPING_STATES = ['idle', 'thinking'];

function AnimatedCharacterBase({ state, size = 160, onFinish }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (state !== 'entry') return;
    setEntered(false);
    // Ek frame chhod ke translate trigger karo, warna browser starting aur
    // ending style ko same maan ke transition skip kar sakta hai.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [state]);

  if (state === 'entry') {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center">
        <div
          onTransitionEnd={() => {
            if (entered) onFinish?.();
          }}
          style={{
            width: size * 0.75,
            height: size * 0.75,
            transform: entered ? 'translateX(0)' : `translateX(-${size}px)`,
            transition: 'transform 1100ms cubic-bezier(0.33,1,0.68,1)',
          }}
        >
          <Lottie animationData={walkAnim} loop autoplay />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <Lottie animationData={SOURCES[state]} loop={LOOPING_STATES.includes(state)} autoplay />
    </div>
  );
}

// memo: sirf `state`/`size` badalne pe re-render, parent (Login) ke baaki
// re-renders (email/password typing) ignore honge.
export const AnimatedCharacter = memo(AnimatedCharacterBase);