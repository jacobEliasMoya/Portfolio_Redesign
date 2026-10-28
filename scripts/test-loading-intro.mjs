import { test } from "node:test";
import assert from "node:assert/strict";
import { getIntroState, getLetterFormation, INTRO_TIMING as timing, LOADING_COMPLETE, EARLIEST_TRANSITION } from "../components/three/animation/loading-intro.mjs";

test("LOADING forms in order, with centers arriving before edges", () => {
  for (let letter = 0; letter < 7; letter++) {
    const time = timing.start + letter * timing.letterStep + 0.2;
    assert.ok(getLetterFormation(time, letter, 0) > getLetterFormation(time, letter, 1));
    if (letter < 6) assert.equal(getLetterFormation(time, letter + 1, 0), 0);
  }
  for (let letter = 0; letter < 7; letter++) assert.equal(getLetterFormation(LOADING_COMPLETE + 0.001, letter, 1), 1);
});
test("the completed word waits indefinitely for real readiness", () => {
  assert.equal(getIntroState(90, null, false).phase, "waiting");
  assert.equal(getIntroState(90, 89, false).phase, "waiting");
});
test("dissipation and reassembly have continuous endpoints", () => {
  const start = EARLIEST_TRANSITION;
  assert.deepEqual(getIntroState(start, start, true), { phase: "dissipating", scatter: 0, gather: 0 });
  const boundary = getIntroState(start + timing.scatter, start, true);
  assert.equal(boundary.scatter, 1);
  assert.ok(boundary.gather < 1e-10);
  const end = getIntroState(start + timing.scatter + timing.gather + 0.001, start, true);
  assert.deepEqual(end, { phase: "ready", scatter: 0, gather: 1 });
});
test("reduced motion skips spatial transitions but respects readiness", () => {
  assert.equal(getIntroState(0.1, null, true, true).phase, "loading");
  assert.equal(getIntroState(1, null, false, true).phase, "loading");
  assert.equal(getIntroState(1, null, true, true).phase, "ready");
});
