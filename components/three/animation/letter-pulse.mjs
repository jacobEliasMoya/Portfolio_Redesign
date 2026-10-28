/** Seconds, shared by the render loop and the sequence tests. */
export const PULSE_TIMING = Object.freeze({ startDelay: 0.4, sweep: 0.85, letterInterval: 0.5, rest: 0.35, letters: 4 });
export const PULSE_RESPONSE = Object.freeze({ attack: 18, release: 3.2 });

/** Follow the outward wave quickly, then settle over roughly a second. */
export function easePulse(current, target, delta) {
  const rate = target > current ? PULSE_RESPONSE.attack : PULSE_RESPONSE.release;
  const step = Math.max(0, Math.min(0.1, Number.isFinite(delta) ? delta : 0));
  return target + (current - target) * Math.exp(-rate * step);
}

/** A smooth radial wave, with gently overlapping neighboring letters.
 * @param {number} letterCount Number of visible glyphs in the current wordmark.
 */
export function getPulseStrength(seconds, letterIndex, radius, reducedMotion = false, letterCount = PULSE_TIMING.letters) {
  if (!Number.isFinite(seconds) || !Number.isInteger(letterIndex) || letterIndex < 0 || letterIndex >= letterCount || !Number.isFinite(radius) || seconds < PULSE_TIMING.startDelay) return 0;
  const cycle = PULSE_TIMING.letterInterval * (letterCount - 1) + PULSE_TIMING.sweep + PULSE_TIMING.rest;
  const phase = (seconds - PULSE_TIMING.startDelay) % cycle;
  const local = phase - letterIndex * PULSE_TIMING.letterInterval;
  if (local < 0 || local >= PULSE_TIMING.sweep) return 0;
  const front = local / PULSE_TIMING.sweep;
  const distance = Math.max(0, Math.min(1, radius)) - front;
  const smooth = (value) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
  const envelope = smooth(local / 0.1) * smooth((PULSE_TIMING.sweep - local) / 0.2);
  return Math.exp(-Math.pow(distance / 0.2, 2)) * envelope * (reducedMotion ? 0.18 : 1);
}
