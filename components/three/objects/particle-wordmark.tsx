"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Color, FileLoader, InstancedMesh, MathUtils, Object3D, PerspectiveCamera, Raycaster, Vector2, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getTextOrbitAngle, orbitTextPoint } from "@/components/three/animation/text-orbit.mjs";
import { getCameraPose } from "@/components/three/animation/camera-choreography.mjs";
import { easePulse, getPulseStrength } from "@/components/three/animation/letter-pulse.mjs";
import { smoothIntro } from "@/components/three/animation/loading-intro.mjs";
import { wrapDuration, wrapFormation, wrapPoint, WRAP_TIMING } from "@/components/three/animation/wrapped-wordmark.mjs";

type Volume = { text: string; positions: number[]; scales: number[]; fragments: number[]; letterIndices: number[]; letterCenters: number[]; letterRadii: number[]; cubeSize: number };
export type IntroPhase = "loading" | "waiting" | "ready";
function parseVolume(raw: unknown): Volume {
  if (typeof raw !== "string") throw new Error("Invalid wrapped text response");
  const data = JSON.parse(raw);
  const count = data.scales?.length;
  if (data.version !== 3 || data.text !== "loading jakes world" || !count || count > 15000 || !Array.isArray(data.positions) || data.positions.length !== count * 3 || !data.positions.every(Number.isFinite) || !data.scales.every((n: number) => Number.isFinite(n) && n > 0 && n <= 2) || !Array.isArray(data.letterCenters) || data.letterCenters.length !== data.text.length * 3 || !data.letterCenters.every(Number.isFinite) || !Array.isArray(data.letterRadii) || data.letterRadii.length !== data.text.length || !data.letterRadii.every((n: number) => Number.isFinite(n) && n > 0) || !Array.isArray(data.letterIndices) || data.letterIndices.length !== count || !data.letterIndices.every((n: number) => Number.isInteger(n) && n >= 0 && n < data.text.length) || !Array.isArray(data.fragments) || data.fragments.length !== count || !data.fragments.every((n: number) => n === 0 || n === 1) || !(data.cubeSize > 0 && data.cubeSize < 1)) throw new Error("Invalid wrapped text volume");
  return data;
}
const noise = (i: number) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

export function ParticleWordmark({ reducedMotion, replay, startRequested, assetsReady, onPhaseChange, onPrepared, onComplete }: {
  reducedMotion: boolean; replay: number; startRequested: boolean; assetsReady: boolean; onPhaseChange: (phase: IntroPhase) => void; onPrepared: () => void; onComplete: () => void;
}) {
  const raw = useLoader(FileLoader, "/models/loading-jakes-world.json");
  const data = useMemo(() => parseVolume(raw), [raw]);
  const camera = useThree((s) => s.camera), canvas = useThree((s) => s.gl.domElement), size = useThree((s) => s.size), invalidate = useThree((s) => s.invalidate);
  const layout = useMemo(() => {
    const radius = Math.min(6.5, size.width / Math.max(1, size.height) * 9.4) * 1.2 + 0.6;
    const xs = data.positions.filter((_, i) => i % 3 === 0);
    const scale = radius * 2.1 / (Math.max(...xs) - Math.min(...xs));
    const letters = [...data.text].flatMap((c, i) => c === " " ? [] : [i]);
    const ordinal = [...data.text].map((_, i) => data.text.slice(0, i).replace(/\s/g, "").length);
    const centers = letters.map((i) => wrapPoint(...data.letterCenters.slice(i * 3, i * 3 + 3) as [number, number, number], scale, radius));
    const targets = data.scales.map((_, i) => wrapPoint(...data.positions.slice(i * 3, i * 3 + 3) as [number, number, number], scale, radius));
    const distances = data.scales.map((_, i) => {
      const letter = data.letterIndices[i];
      return Math.hypot(...data.positions.slice(i * 3, i * 3 + 3).map((v, axis) => v - data.letterCenters[letter * 3 + axis])) / data.letterRadii[letter];
    });
    const shots = centers.map((target) => ({ target, position: [target[0], target[1], target[2] + 5] }));
    return { radius, scale, ordinal, targets, shots, distances, letters: letters.length, complete: wrapDuration(letters.length) };
  }, [data, size.width, size.height]);
  const mesh = useRef<InstancedMesh>(null), elapsed = useRef(0), pulseTime = useRef(0), done = useRef(false), phase = useRef<IntroPhase | null>(null);
  const orbitTime = useRef(0);
  const strengths = useRef(new Float32Array(data.scales.length)), pulls = useRef(new Float32Array(data.scales.length * 3));
  const cursor = useRef({ x: 0, y: 0, active: false });
  const objects = useMemo(() => ({ transform: new Object3D(), color: new Color(), aim: new Vector3(), ray: new Raycaster(), screen: new Vector2(), point: new Vector3(), hit: new Vector3(), target: [0, 0, 0] }), []);
  const geometry = useMemo(() => new RoundedBoxGeometry(data.cubeSize, data.cubeSize, data.cubeSize, 1, data.cubeSize * 0.1), [data.cubeSize]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => { onPrepared(); }, [onPrepared]);
  useEffect(() => { elapsed.current = 0; pulseTime.current = 0; orbitTime.current = 0; done.current = false; phase.current = null; strengths.current.fill(0); pulls.current.fill(0); invalidate(); }, [replay, invalidate]);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      cursor.current = { x: (e.clientX - b.left) / b.width * 2 - 1, y: -((e.clientY - b.top) / b.height * 2 - 1), active: e.pointerType !== "touch" && e.buttons === 0 && e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom };
      invalidate();
    };
    const leave = () => { cursor.current.active = false; invalidate(); };
    canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
    const timer = reducedMotion ? window.setInterval(invalidate, 80) : undefined;
    return () => { canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave); window.clearInterval(timer); };
  }, [canvas, invalidate, reducedMotion]);
  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.visible = startRequested;
    if (!startRequested) return;
    const dt = Math.min(delta, 0.1);
    elapsed.current += dt;
    const formed = reducedMotion ? elapsed.current >= 0.5 : elapsed.current >= layout.complete;
    const ready = done.current || (formed && assetsReady);
    const currentPhase: IntroPhase = ready ? "ready" : formed ? "waiting" : "loading";
    if (phase.current !== currentPhase) { phase.current = currentPhase; onPhaseChange(currentPhase); }
    const pose = getCameraPose(elapsed.current, null, reducedMotion, layout.shots, { start: WRAP_TIMING.start, letterStep: WRAP_TIMING.stagger, complete: layout.complete });
    const focus = 1 - smoothIntro((elapsed.current - (layout.complete - 1.2)) / 1.2);
    if (state.camera instanceof PerspectiveCamera) { state.camera.fov = reducedMotion ? 40 : MathUtils.damp(state.camera.fov, 40 + 45 * focus, 7, dt); state.camera.updateProjectionMatrix(); }
    camera.position.set(...pose.position.map((v, i) => reducedMotion ? v : MathUtils.damp(camera.position.getComponent(i), v, 7, dt)) as [number, number, number]);
    objects.aim.set(...pose.target.map((v, i) => reducedMotion ? v : MathUtils.damp(objects.aim.getComponent(i), v, 7, dt)) as [number, number, number]);
    camera.lookAt(objects.aim); camera.updateMatrixWorld();
    objects.screen.set(cursor.current.x, cursor.current.y); objects.ray.setFromCamera(objects.screen, camera);
    if (done.current) { pulseTime.current += dt; if (!reducedMotion) orbitTime.current += dt; }
    const orbitAngle = getTextOrbitAngle(orbitTime.current);
    for (let i = 0; i < data.scales.length; i++) {
      const letter = data.letterIndices[i], ordinal = layout.ordinal[letter];
      const index = i * 3, target = orbitTextPoint(layout.targets[i], orbitAngle, objects.target);
      const localDistance = layout.distances[i];
      const formation = wrapFormation(elapsed.current, ordinal, localDistance, reducedMotion);
      const fragment = data.fragments[i] === 1;
      const pulse = easePulse(strengths.current[i], ready ? getPulseStrength(pulseTime.current, ordinal, localDistance, reducedMotion, layout.letters) : 0, dt);
      strengths.current[i] = pulse;
      objects.point.set(...target as [number, number, number]); objects.ray.ray.closestPointToPoint(objects.point, objects.hit);
      const distance = objects.hit.distanceTo(objects.point);
      const pull = ready && !reducedMotion && cursor.current.active && target[2] > -9 ? Math.pow(Math.max(0, 1 - distance / 0.8), 2) * (fragment ? 0.5 : 0.25) : 0;
      for (let axis = 0; axis < 3; axis++) pulls.current[index + axis] = reducedMotion ? 0 : MathUtils.damp(pulls.current[index + axis], (objects.hit.getComponent(axis) - target[axis]) * pull, 7, dt);
      const remaining = reducedMotion ? 0 : 1 - formation;
      objects.transform.position.set(target[0] + (noise(i + 3) - 0.5) * 4 * remaining + pulls.current[index], target[1] + (noise(i + 5) - 0.5) * 3 * remaining + pulls.current[index + 1], target[2] + (noise(i + 7) - 0.5) * 3 * remaining + pulls.current[index + 2] + (reducedMotion ? 0 : pulse * 0.08));
      objects.transform.rotation.set(remaining * 3, Math.atan2(target[0], target[2] + 9) + remaining * 2, remaining);
      objects.transform.scale.setScalar(layout.scale * data.scales[i] * (0.45 + 0.55 * formation) * smoothIntro(formation / 0.3) * (reducedMotion ? 1 : 1 + pulse * 0.12));
      objects.transform.updateMatrix(); mesh.current.setMatrixAt(i, objects.transform.matrix);
      const silver = (fragment ? 0.45 : 0.7) + noise(i + 19) * 0.25 + pulse * 0.4;
      objects.color.setRGB(silver, silver, silver + pulse * 0.03); mesh.current.setColorAt(i, objects.color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    if (ready && !done.current) { done.current = true; onComplete(); }
    if (!reducedMotion || !ready) state.invalidate();
  });
  return <instancedMesh visible={startRequested} ref={mesh} args={[undefined, undefined, data.scales.length]} frustumCulled={false}>
    <primitive object={geometry} attach="geometry" /><meshStandardMaterial color="#f0f1f5" metalness={0.48} roughness={0.3} />
  </instancedMesh>;
}
