/** Traveling concentric crests measured along the sphere, not through it. */
export function getOceanRipple(seconds, angularDistance) {
  if (!Number.isFinite(seconds) || !Number.isFinite(angularDistance)) return 0;
  const phase = angularDistance * 3.5 - seconds * 1.35;
  // Rounded, narrow crests with a broad quiet trough; continuous across repeats.
  return Math.pow((Math.cos(phase) + 1) / 2, 5);
}
