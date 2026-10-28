export const INTRO_TIMING = Object.freeze({ start: 0.1, letterStep: 0.75, formation: 1.4, letters: 7, hold: 0.45, scatter: 1.1, gather: 2.3, reducedHold: 0.5 });
export const LOADING_COMPLETE = INTRO_TIMING.start + INTRO_TIMING.letterStep * (INTRO_TIMING.letters - 1) + INTRO_TIMING.formation + 0.12;
export const EARLIEST_TRANSITION = LOADING_COMPLETE + INTRO_TIMING.hold;
const clamp = (n) => Math.max(0, Math.min(1, n));
export const smoothIntro = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function getLetterFormation(seconds, letter, radius, reducedMotion = false) {
  if (reducedMotion) return 1;
  const delay = INTRO_TIMING.start + letter * INTRO_TIMING.letterStep + clamp(radius) * 0.12;
  return smoothIntro((seconds - delay) / INTRO_TIMING.formation);
}

export function getIntroState(seconds, transitionStart, assetsReady, reducedMotion = false) {
  if (reducedMotion) return { phase: assetsReady && seconds >= INTRO_TIMING.reducedHold ? "ready" : "loading", scatter: 0, gather: assetsReady && seconds >= INTRO_TIMING.reducedHold ? 1 : 0 };
  if (transitionStart === null || !assetsReady) return { phase: seconds < LOADING_COMPLETE ? "loading" : "waiting", scatter: 0, gather: 0 };
  const elapsed = Math.max(0, seconds - transitionStart);
  if (elapsed < INTRO_TIMING.scatter) return { phase: "dissipating", scatter: smoothIntro(elapsed / INTRO_TIMING.scatter), gather: 0 };
  if (elapsed < INTRO_TIMING.scatter + INTRO_TIMING.gather) return { phase: "rematerializing", scatter: 1, gather: smoothIntro((elapsed - INTRO_TIMING.scatter) / INTRO_TIMING.gather) };
  return { phase: "ready", scatter: 0, gather: 1 };
}
