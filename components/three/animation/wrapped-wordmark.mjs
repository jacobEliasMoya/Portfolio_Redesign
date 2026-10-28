/** Place a flat font sample around the globe's front equatorial arc. */
export function wrapPoint(x, y, z, scale, radius) {
  const angle = x * scale / radius;
  const r = radius + z * scale;
  return [Math.sin(angle) * r, y * scale + 0.35, Math.cos(angle) * r - 9];
}
export const WRAP_TIMING = Object.freeze({ start: 0.1, stagger: 0.32, formation: 1.4 });
export function wrapFormation(time, letter, distance, reducedMotion = false) {
  if (reducedMotion) return 1;
  const t = Math.max(0, Math.min(1, (time - WRAP_TIMING.start - letter * WRAP_TIMING.stagger - Math.min(1, distance) * 0.12) / WRAP_TIMING.formation));
  return t * t * (3 - 2 * t);
}
export function wrapDuration(letters) { return WRAP_TIMING.start + (letters - 1) * WRAP_TIMING.stagger + WRAP_TIMING.formation + 0.12; }
