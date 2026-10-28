/** Clockwise when seen from +Y (north pole); ease up to one turn in about 35s. */
export function getTextOrbitAngle(seconds) {
  const t = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  return t === 0 ? 0 : -0.18 * (t - 2 * (1 - Math.exp(-t / 2)));
}
/** Rotate about Earth's Y axis at z=-9, retaining each block's height and depth. */
export function orbitTextPoint(point, angle, output = [0, 0, 0]) {
  const c = Math.cos(angle), s = Math.sin(angle), z = point[2] + 9;
  output[0] = point[0] * c + z * s;
  output[1] = point[1];
  output[2] = -point[0] * s + z * c - 9;
  return output;
}
