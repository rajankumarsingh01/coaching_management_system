// src/components/common/AnimatedCharacter.jsx
//
// Login screen ka onboarding character.
// NOTE: `lottie-react` ki jagah `lottie-web` seedha use ho raha hai
// (Vite/Rollup production build interop bug se bachne ke liye).

import { useEffect, useRef, useState, memo } from 'react';
import * as LottieWebModule from 'lottie-web';
const lottie = LottieWebModule.default ?? LottieWebModule;

import idleAnim from '../../assets/lottie/character-idle.json';
import thinkingAnim from '../../assets/lottie/character-thinking.json';
import successAnim from '../../assets/lottie/character-success.json';
import errorAnim from '../../assets/lottie/character-error.json';
import walkAnim from '../../assets/lottie/character-walk.json';

const SOURCES = {
  entry: walkAnim,
  idle: idleAnim,
  thinking: thinkingAnim,
  success: successAnim,
  error: errorAnim,
};

const LOOPING_STATES = ['entry', 'idle', 'thinking'];

// Entry sequence ki timing — yahin se poori speed control hoti hai.
const WALK_DURATION_MS = 2200; // pehle 1100 tha — ab dugna
const SETTLE_PAUSE_MS = 500;   // walk khatam hone ke baad thoda ruk ke form reveal

function useLottie(containerRef, animationData, loop) {
  useEffect(() => {
    if (!containerRef.current || !animationData) return undefined;
    const instance = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData,
    });
    return () => instance.destroy();
  }, [containerRef, animationData, loop]);
}

function AnimatedCharacterBase({ state, size = 160, onFinish }) {
  const containerRef = useRef(null);
  const [entered, setEntered] = useState(false);

  useLottie(containerRef, SOURCES[state], LOOPING_STATES.includes(state));

  useEffect(() => {
    if (state !== 'entry') return undefined;
    setEntered(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [state]);

  if (state === 'entry') {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center">
        <div
          onTransitionEnd={() => {
            if (entered) {
              // Walk khatam hote hi turant reveal na ho, thoda ruk jaaye —
              // isse form ka aana zyada natural lagta hai.
              setTimeout(() => onFinish?.(), SETTLE_PAUSE_MS);
            }
          }}
          style={{
            width: size * 0.75,
            height: size * 0.75,
            transform: entered ? 'translateX(0)' : `translateX(-${size}px)`,
            transition: `transform ${WALK_DURATION_MS}ms cubic-bezier(0.33,1,0.68,1)`,
          }}
        >
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export const AnimatedCharacter = memo(AnimatedCharacterBase);