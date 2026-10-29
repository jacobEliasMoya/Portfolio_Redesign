import { INTRO_TIMING, LOADING_COMPLETE } from "./loading-intro.mjs";

// Zero velocity and acceleration at both ends avoids a hard change of pace.
const easeCamera = (value) => { const t = Math.max(0, Math.min(1, value)); return t * t * t * (t * (t * 6 - 15) + 10); };
const home = [0, 0, 22];
const bezier = (a, b, c, d, t) => {
  const u = 1 - t;
  return a.map((v, i) => u ** 3 * v + 3 * u ** 2 * t * b[i] + 3 * u * t ** 2 * c[i] + t ** 3 * d[i]);
};

/** Curved travel between close-up letter shots and the full-word reveal.
 * @param {{position: number[], target: number[]}[]} shots World-space letter close-ups.
 * @param {{start: number, letterStep: number, complete: number}} timing Sequence timing.
 */
export function getCameraPose(seconds, transitionStart, reducedMotion = false, shots = [], timing = { start: INTRO_TIMING.start, letterStep: INTRO_TIMING.letterStep, complete: LOADING_COMPLETE }) {
  if (reducedMotion) return { position: [...home], target: [0, 0, 0] };
  let position = [...home];
  let target = [0, 0, 0];
  if (transitionStart === null) {
    if (shots.length) {
      const anchors = [
        { time: 0, position: home, target: [0, 0, 0] },
        ...shots.map((shot, i) => ({ time: timing.start + i * timing.letterStep + 0.5, ...shot })),
        { time: timing.complete, position: home, target: [0, 0, 0] },
      ];
      const next = anchors.findIndex((anchor) => anchor.time > seconds);
      if (next > 0) {
        const a = anchors[next - 1], b = anchors[next];
        const t = easeCamera((seconds - a.time) / (b.time - a.time));
        const lift = 0.8;
        target = a.target.map((v, i) => v + (b.target[i] - v) * t);
        const z = bezier(a.position,
          [a.position[0], a.position[1], a.position[2] + lift],
          [b.position[0], b.position[1], b.position[2] + lift], b.position, t)[2];
        // Position and aim share X/Y, so the lens always faces the lettering squarely.
        position = [target[0], target[1], z];
      }
    }
  } else {
    const local = Math.max(0, seconds - transitionStart);
    if (local < INTRO_TIMING.scatter) {
      const t = easeCamera(local / INTRO_TIMING.scatter);
      position = bezier(home, [0, 0, home[2] + .6], [0, 0, home[2] + 1.4], [0, 0, home[2] + .8], t);
    } else {
      const t = easeCamera((local - INTRO_TIMING.scatter) / INTRO_TIMING.gather);
      position = bezier([0, 0, home[2] + .8], [0, 0, home[2] - 1.6], [0, 0, home[2] - 1.7], home, t);
      target = [0, 0, 0];
    }
  }
  return { position, target };
}
