"use client";
import {useObjectDrag} from "@/hooks/use-object-drag";
import {orbitSlideDelta} from "@/components/three/animation/object-drag.mjs";
import { getProjectileTarget } from "@/components/three/ufo/projectile-collision.mjs";
import { useDestructibleInstances } from "@/hooks/use-destructible-instances";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Color, DynamicDrawUsage, FileLoader, InstancedMesh, MathUtils, Object3D, Raycaster, Vector2, Vector3 } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { particleRepulsion } from "@/components/three/animation/particle-repulsion.mjs";
import { getTextOrbitAngle } from "@/components/three/animation/text-orbit.mjs";
import { easePulse, getPulseStrength } from "@/components/three/animation/letter-pulse.mjs";
import { smoothIntro } from "@/components/three/animation/loading-intro.mjs";
import { titleDuration, titleWrapProgress, wrapFormation, wrapPoint } from "@/components/three/animation/wrapped-wordmark.mjs";

type Volume = { text: string; positions: number[]; scales: number[]; fragments: number[]; letterIndices: number[]; letterCenters: number[]; letterRadii: number[]; cubeSize: number; layoutWidth?:number };
export type IntroPhase = "loading" | "waiting" | "ready";
function parseVolume(raw: unknown): Volume {
  if (typeof raw !== "string") throw new Error("Invalid wrapped text response");
  const data = JSON.parse(raw);
  const count = data.scales?.length;
  if (data.version !== 3 || data.text !== "Jakes Space" || !count || count > 15000 || !Array.isArray(data.positions) || data.positions.length !== count * 3 || !data.positions.every(Number.isFinite) || !data.scales.every((n: number) => Number.isFinite(n) && n > 0 && n <= 2) || !Array.isArray(data.letterCenters) || data.letterCenters.length !== data.text.length * 3 || !data.letterCenters.every(Number.isFinite) || !Array.isArray(data.letterRadii) || data.letterRadii.length !== data.text.length || !data.letterRadii.every((n: number) => Number.isFinite(n) && n > 0) || !Array.isArray(data.letterIndices) || data.letterIndices.length !== count || !data.letterIndices.every((n: number) => Number.isInteger(n) && n >= 0 && n < data.text.length) || !Array.isArray(data.fragments) || data.fragments.length !== count || !data.fragments.every((n: number) => n === 0 || n === 1) || !(data.cubeSize > 0 && data.cubeSize < 1)) throw new Error("Invalid wrapped text volume");
  if(data.layoutWidth!==undefined&&(!Number.isFinite(data.layoutWidth)||data.layoutWidth<=0))throw new Error("Invalid text layout width");
  return data;
}
const noise = (i: number) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

export function ParticleWordmark({ shipPositionRef, piloting, reducedMotion, replay, startRequested, assetsReady, onPhaseChange, onPrepared, onComplete }: {
  shipPositionRef:RefObject<Vector3>; piloting:boolean; reducedMotion: boolean; replay: number; startRequested: boolean; assetsReady: boolean; onPhaseChange: (phase: IntroPhase) => void; onPrepared: () => void; onComplete: () => void;
}) {
  const raw = useLoader(FileLoader, "/models/jakes-space-particle-core.json");
  const data = useMemo(() => parseVolume(raw), [raw]);
  const camera = useThree((s) => s.camera), canvas = useThree((s) => s.gl.domElement), size = useThree((s) => s.size), invalidate = useThree((s) => s.invalidate);
  const layout = useMemo(() => {
    const earthRadius=Math.min(6.5,size.width/Math.max(1,size.height)*9.4);
    const radius=earthRadius*1.5+.8;
    const xs = data.positions.filter((_, i) => i % 3 === 0);
    const scale = (earthRadius*1.2+.6) * 2.1 / (data.layoutWidth??(Math.max(...xs) - Math.min(...xs)));
    const letters = [...data.text].flatMap((c, i) => c === " " ? [] : [i]);
    const ordinal = [...data.text].map((_, i) => data.text.slice(0, i).replace(/\s/g, "").length);
    const targets = data.scales.map((_, i) => wrapPoint(...data.positions.slice(i * 3, i * 3 + 3) as [number, number, number], scale, radius));
    const distances = data.scales.map((_, i) => {
      const letter = data.letterIndices[i];
      return Math.hypot(...data.positions.slice(i * 3, i * 3 + 3).map((v, axis) => v - data.letterCenters[letter * 3 + axis])) / data.letterRadii[letter];
    });
    const scatter=data.scales.map((_,i)=>[(noise(i+3)-.5)*4,(noise(i+5)-.5)*3,(noise(i+7)-.5)*3]);
    const shades=data.scales.map((_,i)=>(data.fragments[i]===1?.45:.7)+noise(i+19)*.25);
    const angles=targets.map(p=>Math.atan2(p[0],p[2]+9));
    const wordFocus=(start:number,end:number)=>{
      const center=[0,0,0];for(let letter=start;letter<end;letter++)for(let axis=0;axis<3;axis++)center[axis]+=data.letterCenters[letter*3+axis]/(end-start);
      return wrapPoint(center[0],center[1],center[2],scale,radius);
    };
    const tourFocus=wordFocus(0,4),spaceFocus=wordFocus(data.text.indexOf("Space"),data.text.length);
    return { tourFocus,spaceFocus,scatter,shades,angles,radius, scale, ordinal, targets, distances, letters: letters.length, complete: titleDuration(letters.length) };
  }, [data, size.width, size.height]);
  const mesh = useRef<InstancedMesh>(null), elapsed = useRef(0), pulseTime = useRef(0), done = useRef(false), phase = useRef<IntroPhase | null>(null);
  const destroyed=useDestructibleInstances(mesh,{blast:.35,padding:.15,dynamic:true,mode:"explode"});
  const earthBurst=useRef(false);
  const orbitDrag=useRef({active:false,target:0,value:0,angle:0});
  const orbitTime = useRef(0), targetBuffer=useRef([0,0,0]);
  const repels=useRef(new Float32Array(data.scales.length*3)),repelTarget=useRef([0,0,0]);
  const strengths = useRef(new Float32Array(data.scales.length)), pulls = useRef(new Float32Array(data.scales.length * 3));
  const cursor = useRef({ x: 0, y: 0, active: false });
  const objects = useMemo(() => ({ transform: new Object3D(), color: new Color(), ray: new Raycaster(), screen: new Vector2(), point: new Vector3(), hit: new Vector3(),tourFocus:new Vector3(),spaceFocus:new Vector3() }), []);
  const geometry = useMemo(() => {
    const original=new RoundedBoxGeometry(data.cubeSize,data.cubeSize,data.cubeSize,1,data.cubeSize*.1);
    const indexed=mergeVertices(original);original.dispose();return indexed;
  }, [data.cubeSize]);
  useEffect(()=>{mesh.current?.instanceMatrix.setUsage(DynamicDrawUsage);},[]);
  useEffect(()=>{const object=mesh.current;if(!object)return;object.userData.tourFocus=objects.tourFocus;object.userData.tourSpaceFocus=objects.spaceFocus;return()=>{delete object.userData.tourFocus;delete object.userData.tourSpaceFocus;};},[objects]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => { onPrepared(); }, [onPrepared]);
  useEffect(() => { elapsed.current = 0; pulseTime.current = 0; orbitTime.current = 0;orbitDrag.current={active:false,target:0,value:0,angle:0}; done.current = false; phase.current = null; strengths.current.fill(0); pulls.current.fill(0); repels.current.fill(0); invalidate(); }, [replay, invalidate]);
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
  useObjectDrag({object:mesh,radius:data.cubeSize*.9,instances:true,enabled:!piloting&&startRequested,
    available:()=>done.current&&!earthBurst.current,
    onStart:(point)=>{orbitDrag.current.active=true;orbitDrag.current.angle=Math.atan2(point.x,point.z+9);cursor.current.active=false;},
    onMove:({dx,dy,camera})=>{const change=orbitSlideDelta(dx,dy,orbitDrag.current.angle,camera.quaternion);orbitDrag.current.target+=change;orbitDrag.current.angle+=change;},
    onEnd:()=>{orbitDrag.current.active=false;}
  });
  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.visible = startRequested;
    if (!startRequested) return;
    const dt = Math.min(delta, 0.1);
    const target=getProjectileTarget(mesh.current);
    if(!earthBurst.current)state.scene.traverse(object=>{
      const planet=getProjectileTarget(object),status=planet?.foundation>2?planet.planetPhase():"intact";
      if(!earthBurst.current&&(status==="exploding"||status==="gone")){
        earthBurst.current=true;target?.explodeAll(new Vector3(0,.35,-9));
      }
    });
    const fragments=target?.stepDebris(dt,reducedMotion)??0;
    if(fragments)state.invalidate();
    if(earthBurst.current){mesh.current.visible=fragments>0;return;}
    elapsed.current += dt;
    const formed = reducedMotion ? elapsed.current >= 0.5 : elapsed.current >= layout.complete;
    const wrap = titleWrapProgress(elapsed.current, layout.letters, reducedMotion);
    const ready = done.current || (formed && assetsReady);
    const currentPhase: IntroPhase = ready ? "ready" : formed ? "waiting" : "loading";
    if (phase.current !== currentPhase) { phase.current = currentPhase; onPhaseChange(currentPhase); }
    objects.screen.set(cursor.current.x, cursor.current.y); objects.ray.setFromCamera(objects.screen, camera);
    if (done.current) { pulseTime.current += dt; if (!reducedMotion&&!orbitDrag.current.active) orbitTime.current += dt; }
    orbitDrag.current.value=reducedMotion?orbitDrag.current.target:MathUtils.damp(orbitDrag.current.value,orbitDrag.current.target,18,dt);
    const orbitAngle = getTextOrbitAngle(orbitTime.current)+orbitDrag.current.value, orbitCos=Math.cos(orbitAngle), orbitSin=Math.sin(orbitAngle);
    objects.tourFocus.set(layout.tourFocus[0]*orbitCos+(layout.tourFocus[2]+9)*orbitSin,layout.tourFocus[1],-layout.tourFocus[0]*orbitSin+(layout.tourFocus[2]+9)*orbitCos-9);
    objects.spaceFocus.set(layout.spaceFocus[0]*orbitCos+(layout.spaceFocus[2]+9)*orbitSin,layout.spaceFocus[1],-layout.spaceFocus[0]*orbitSin+(layout.spaceFocus[2]+9)*orbitCos-9);
    const magnetic=ready&&!reducedMotion&&!orbitDrag.current.active&&cursor.current.active;
    for (let i = 0; i < data.scales.length; i++) {
      if(destroyed.current.has(i))continue;
      const letter = data.letterIndices[i], ordinal = layout.ordinal[letter];
      const index = i * 3, rest=layout.targets[i],target=targetBuffer.current;
      const flatX=data.positions[index]*layout.scale, flatZ=layout.radius-9+data.positions[index+2]*layout.scale;
      target[0]=MathUtils.lerp(flatX,rest[0],wrap)*orbitCos+(MathUtils.lerp(flatZ,rest[2],wrap)+9)*orbitSin;target[1]=rest[1];target[2]=-MathUtils.lerp(flatX,rest[0],wrap)*orbitSin+(MathUtils.lerp(flatZ,rest[2],wrap)+9)*orbitCos-9;
      const localDistance = layout.distances[i];
      const formation = formed ? 1 : wrapFormation(elapsed.current, ordinal, localDistance, reducedMotion);
      const fragment = data.fragments[i] === 1;
      const pulse = easePulse(strengths.current[i], ready ? getPulseStrength(pulseTime.current, ordinal, localDistance, reducedMotion, layout.letters) : 0, dt);
      strengths.current[i] = pulse;
      if(magnetic){objects.point.set(...target as [number, number, number]); objects.ray.ray.closestPointToPoint(objects.point, objects.hit);}
      const distance = magnetic ? objects.hit.distanceTo(objects.point) : Infinity;
      const pull = ready && !reducedMotion && cursor.current.active && target[2] > -9 ? Math.pow(Math.max(0, 1 - distance / 0.8), 2) * (fragment ? 0.5 : 0.25) : 0;
      for (let axis = 0; axis < 3; axis++) pulls.current[index + axis] = reducedMotion ? 0 : MathUtils.damp(pulls.current[index + axis], (objects.hit.getComponent(axis) - target[axis]) * pull, 7, dt);
      const displacement=piloting&&!reducedMotion?particleRepulsion(target,shipPositionRef.current,1.8,repelTarget.current):repelTarget.current.fill(0);
      for(let axis=0;axis<3;axis++)repels.current[index+axis]=reducedMotion?0:MathUtils.damp(repels.current[index+axis],displacement[axis],piloting?10:4,dt);
      const remaining = reducedMotion ? 0 : 1 - formation;
      objects.transform.position.set(target[0] + layout.scatter[i][0] * remaining + pulls.current[index] + repels.current[index], target[1] + layout.scatter[i][1] * remaining + pulls.current[index + 1] + repels.current[index+1], target[2] + layout.scatter[i][2] * remaining + pulls.current[index + 2] + repels.current[index+2] + (reducedMotion ? 0 : pulse * 0.08));
      objects.transform.rotation.set(remaining * 3, layout.angles[i] * wrap + orbitAngle + remaining * 2, remaining);
      objects.transform.scale.setScalar(layout.scale * data.scales[i] * (0.45 + 0.55 * formation) * smoothIntro(formation / 0.3) * (reducedMotion ? 1 : 1 + pulse * 0.12));
      objects.transform.updateMatrix(); mesh.current.setMatrixAt(i, objects.transform.matrix);
      const silver = layout.shades[i] + pulse * 0.4;
      objects.color.setRGB(silver, silver, silver + pulse * 0.03); mesh.current.setColorAt(i, objects.color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    if (ready && !done.current) { done.current = true; onComplete(); }
    if (!reducedMotion || !ready || Math.abs(orbitDrag.current.value-orbitDrag.current.target)>.0001) state.invalidate();
  });
  return <instancedMesh name="tour-jake" visible={startRequested} ref={mesh} args={[undefined, undefined, data.scales.length]} frustumCulled={false}>
    <primitive object={geometry} attach="geometry" /><meshStandardMaterial color="#f0f1f5" metalness={0.48} roughness={0.3} />
  </instancedMesh>;
}
