/** Place a flat font sample around the globe's front equatorial arc. */
export function wrapPoint(x, y, z, scale, radius) {
  const angle = x * scale / radius;
  const r = radius + z * scale;
  return [Math.sin(angle) * r, y * scale + 0.35, Math.cos(angle) * r - 9];
}
export const WRAP_TIMING = Object.freeze({ start: 0.05, stagger: 0.12, formation: 0.65, ripple: 0.08, hold: 0.6, bend: 1.05 });
export function wrapFormation(time, letter, distance, reducedMotion = false) {
  if (reducedMotion) return 1;
  const t = Math.max(0, Math.min(1, (time - WRAP_TIMING.start - letter * WRAP_TIMING.stagger - Math.min(1, distance) * WRAP_TIMING.ripple) / WRAP_TIMING.formation));
  return t * t * (3 - 2 * t);
}
export function wrapDuration(letters) { return WRAP_TIMING.start + (letters - 1) * WRAP_TIMING.stagger + WRAP_TIMING.formation + WRAP_TIMING.ripple; }

// Form a readable flat title, hold, then bend the same particles into orbit.
export function titleWrapProgress(time, letters, reducedMotion=false) {
  if(reducedMotion)return 1;
  const t=Math.max(0,Math.min(1,(time-wrapDuration(letters)-WRAP_TIMING.hold)/WRAP_TIMING.bend));
  return t*t*t*(t*(t*6-15)+10);
}
export function titleDuration(letters){return wrapDuration(letters)+WRAP_TIMING.hold+WRAP_TIMING.bend;}
