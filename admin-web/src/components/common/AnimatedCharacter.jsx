// src/components/common/AnimatedCharacter.jsx
//
// Login screen ka onboarding character.
// NOTE: `lottie-react` (React wrapper) jaan-bujh kar use nahi kiya — us
// package ka Vite/Rollup production build ke saath CJS/ESM export interop
// tootta hai (React error #130, white screen on Vercel, dev me theek chalta
// tha). Iski jagah `lottie-web` seedha use kar rahe hain — ye plain JS
// function hai (`loadAnimation`), koi React-component export nahi, isliye
// ye interop bug apply hi nahi hota.

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

// Reusable hook — diye gaye container div me lottie animation load/switch/
// cleanup karta hai. State badalte hi purani animation destroy ho ke nayi
// load hoti hai.
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
    // Ek frame chhod ke translate trigger karo, warna browser starting aur
    // ending style ko same maan ke transition skip kar sakta hai.
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
            if (entered) onFinish?.();
          }}
          style={{
            width: size * 0.75,
            height: size * 0.75,
            transform: entered ? 'translateX(0)' : `translateX(-${size}px)`,
            transition: 'transform 1100ms cubic-bezier(0.33,1,0.68,1)',
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

// memo: sirf `state`/`size` badalne pe re-render, parent (Login) ke baaki
// re-renders (email/password typing) ignore honge.
export const AnimatedCharacter = memo(AnimatedCharacterBase);