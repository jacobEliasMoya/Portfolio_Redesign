"use client";
import {useObjectDrag} from "@/hooks/use-object-drag";
import {applyEarthDrag} from "../planet/earth-rotation.mjs";
import { LunarFlag } from "./lunar-flag";
import { LunarLandingPad } from "./lunar-landing-pad";
import { ImpactSmoke } from "../planet/impact-smoke";
import { scorchLunarSkin } from "./lunar-impact.mjs";
import { applyImpactGlow } from "@/components/three/planet/impact-material.mjs";
import { PLANET_HITS } from "@/components/three/planet/planet-explosion.mjs";
import { getProjectileTarget } from "@/components/three/ufo/projectile-collision.mjs";
import { useDestructibleInstances } from "@/hooks/use-destructible-instances";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { BufferGeometry, Color, DoubleSide, DynamicDrawUsage, FileLoader, Float32BufferAttribute, Group, InstancedBufferAttribute, InstancedMesh, MathUtils, Object3D, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { createHexagonalEarthGeometry } from "@/components/three/planet/hexagonal-earth-geometry.mjs";
import { getMoonOrbitPose, MOON_ORBIT, releaseMoon, advanceFreeMoon } from "./moon-orbit.mjs";

type LunarVolume = { version: number; radius: number; positions: number[]; normals: number[]; sizes: number[]; colors: number[]; skin: { positions: number[]; colors: number[]; indices: number[] } };
function parseMoon(raw: unknown): LunarVolume {
  if (typeof raw !== "string") throw new Error("Invalid lunar data response");
  const data = JSON.parse(raw) as LunarVolume;
  const count = data.sizes?.length;
  if (data.version !== 2 || data.radius !== .82 || !count || count > 60000 ||
    ![data.positions,data.normals,data.colors].every((values)=>Array.isArray(values)&&values.length===count*3&&values.every(Number.isFinite)) ||
    !data.sizes.every((n)=>Number.isFinite(n)&&n>0&&n<.3) || !data.colors.every((n)=>n>=0&&n<=1)) throw new Error("Invalid lunar geometry data");
  const skin=data.skin;
  if(!skin || !Array.isArray(skin.positions) || skin.positions.length%3 || skin.positions.length>150000 || !skin.positions.every(Number.isFinite) || !Array.isArray(skin.colors) || skin.colors.length!==skin.positions.length || !skin.colors.every((n)=>Number.isFinite(n)&&n>=0&&n<=1) || !Array.isArray(skin.indices) || skin.indices.length%3 || skin.indices.length>400000 || !skin.indices.every((n)=>Number.isInteger(n)&&n>=0&&n<skin.positions.length/3)) throw new Error("Invalid lunar survey skin");
  return data;
}
/** Reusable survey-derived solid lunar surface; local +Z is the near-side face. */
export function BlockMoon({ radius = .82, rotation = [0,0,0], reducedMotion=false,draggable=false,gravity=true,gravityPower=1 }: { radius?: number; rotation?: [number,number,number]; reducedMotion?:boolean;draggable?:boolean;gravity?:boolean;gravityPower?:number }) {
  const raw = useLoader(FileLoader,"/models/moon/block-moon.json?revision=solid-chunky-3");
  const data = useMemo(()=>parseMoon(raw),[raw]);
  const mesh = useRef<InstancedMesh>(null),interior=useRef<Group>(null),processedMarks=useRef(0);
  const control=useRef<Group>(null),orientation=useRef(new Quaternion()),dragSpace=useMemo(()=>new Quaternion(),[]);
  useObjectDrag({object:mesh,radius:.94,enabled:draggable,
    available:()=>!mesh.current||((getProjectileTarget(mesh.current)?.planetPhase()??"intact")==="intact"),
    onMove:({dx,dy,camera})=>{if(!control.current?.parent)return;control.current.parent.getWorldQuaternion(dragSpace);dragSpace.invert().multiply(camera.quaternion);applyEarthDrag(orientation.current,dx,dy,dragSpace);}
  });
  useDestructibleInstances(mesh,{foundation:.70,blast:.10,padding:.012,mode:"explode",threshold:PLANET_HITS.moon});
  const geometry = useMemo(()=>{const tile=createHexagonalEarthGeometry();tile.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(data.sizes.length),1));return tile;},[data.sizes.length]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const skin=useMemo(()=>{
    const surface=new BufferGeometry(), color=new Color();
    const linear=new Float32Array(data.skin.colors.length);
    for(let i=0;i<linear.length;i+=3){color.setRGB(data.skin.colors[i],data.skin.colors[i+1],data.skin.colors[i+2],SRGBColorSpace);color.toArray(linear,i);}
    surface.setAttribute("position",new Float32BufferAttribute(data.skin.positions,3));
    surface.setAttribute("color",new Float32BufferAttribute(linear,3));
    surface.setIndex(data.skin.indices);surface.computeVertexNormals();surface.computeBoundingSphere();
    return surface;
  },[data]);
  useEffect(()=>()=>skin.dispose(),[skin]);
  useEffect(()=>{
    if (!mesh.current) return;
    mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
    const transform = new Object3D(), normal = new Vector3(), up = new Vector3(0,1,0), color = new Color();
    for(let i=0;i<data.sizes.length;i++) {
      transform.position.fromArray(data.positions,i*3);
      transform.quaternion.setFromUnitVectors(up,normal.fromArray(data.normals,i*3).normalize());
      transform.scale.set(data.sizes[i]*1.65,data.sizes[i]*1.15,data.sizes[i]*1.65);
      transform.updateMatrix();mesh.current.setMatrixAt(i,transform.matrix);
      color.setRGB(data.colors[i*3],data.colors[i*3+1],data.colors[i*3+2],SRGBColorSpace);mesh.current.setColorAt(i,color);
    }
    mesh.current.instanceMatrix.needsUpdate=true;
    if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
  },[data]);
  useFrame((state,delta)=>{
    if(control.current){if(reducedMotion)control.current.quaternion.copy(orientation.current);else control.current.quaternion.slerp(orientation.current,1-Math.exp(-14*Math.min(delta,.1)));if(control.current.quaternion.angleTo(orientation.current)>.0001)state.invalidate();}
    const target=mesh.current?getProjectileTarget(mesh.current):null;
    const phase=target?.stepPlanetExplosion(delta,reducedMotion)??"intact";
    if(phase!=="gone"&&target){
      while(processedMarks.current<target.impactMarks.length){scorchLunarSkin(skin,target.impactMarks[processedMarks.current]);processedMarks.current++;}
      if(target.stepDebris(delta,reducedMotion))state.invalidate();
    }
    if(interior.current)interior.current.visible=phase==="intact"||phase==="charging";
    if(phase==="charging"||phase==="exploding")state.invalidate();
  },-1.5);
  return <group scale={radius/data.radius} rotation={rotation}><group ref={control}>
    <group ref={interior}><mesh><sphereGeometry args={[.70,48,32]} /><meshStandardMaterial color="#85838a" roughness={.95} side={DoubleSide} transparent={false} /></mesh>
    <mesh><primitive object={skin} attach="geometry"/><meshStandardMaterial vertexColors roughness={.94} metalness={0} side={DoubleSide} transparent={false}/></mesh>
    </group><instancedMesh name="tour-moon" userData={{projectileGravity:{enabled:gravity,power:gravityPower,radius:data.radius,kind:"moon"}}} ref={mesh} args={[undefined,undefined,data.sizes.length]} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" /><meshStandardMaterial roughness={.88} metalness={.02} transparent={false} onBeforeCompile={applyImpactGlow} customProgramCacheKey={()=>"moon-impact-glow-v3"} />
    </instancedMesh>
    <LunarLandingPad moon={mesh}/>
    <LunarFlag moon={mesh} reducedMotion={reducedMotion}/>
    <ImpactSmoke earth={mesh} surfaceRadius={data.radius} kind="moon" reducedMotion={reducedMotion}/>
  </group></group>;
}

/** The same orbital phase drives position and yaw: exactly one spin per revolution. */
export function OrbitingMoon({ earthRadius, enabled, reducedMotion, draggable=false, center = [0,.35,-9],gravity=true,gravityPower=1 }: {
  earthRadius: number; enabled: boolean; reducedMotion: boolean; draggable?:boolean; center?: [number,number,number];gravity?:boolean;gravityPower?:number;
}) {
  const group = useRef<Group>(null), reveal = useRef<Group>(null), elapsed = useRef(0), amount = useRef(0);
  const released=useRef<ReturnType<typeof releaseMoon>|null>(null);
  const moonRadius = earthRadius * .273;
  const distance = earthRadius * 3.6 + moonRadius;
  const initial = getMoonOrbitPose(0,distance);
  useFrame((state,delta)=>{
    const dt=Math.min(delta,.1);
    if(!released.current&&enabled)state.scene.traverse(object=>{
      const target=getProjectileTarget(object),phase=target?.foundation>2?target.planetPhase():"intact";
      if(!released.current&&(phase==="exploding"||phase==="gone"))released.current=releaseMoon(elapsed.current,distance);
    });
    if(released.current){
      if(enabled&&!reducedMotion)advanceFreeMoon(released.current,dt);
      if(group.current){group.current.position.set(...released.current.position as [number,number,number]);group.current.rotation.set(...released.current.rotation as [number,number,number]);}
    }else{
      if(enabled&&!reducedMotion)elapsed.current+=dt;
      const pose=getMoonOrbitPose(elapsed.current,distance);
      if(group.current){group.current.position.set(...pose.position as [number,number,number]);group.current.rotation.y=pose.yaw;}
    }
    amount.current=reducedMotion?Number(enabled):MathUtils.damp(amount.current,Number(enabled),2,dt);
    if(reveal.current){reveal.current.scale.setScalar(amount.current);reveal.current.visible=amount.current>.001;}
    if((enabled&&!reducedMotion)||Math.abs(amount.current-Number(enabled))>.001)state.invalidate();
  },-2);
  return <group position={center} rotation={[MOON_ORBIT.inclination,0,MOON_ORBIT.node]}>
    <group ref={group} position={initial.position as [number,number,number]} rotation={[0,initial.yaw,0]}>
      <group ref={reveal} scale={0}><BlockMoon radius={moonRadius} reducedMotion={reducedMotion} draggable={draggable&&enabled} gravity={gravity} gravityPower={gravityPower}/></group>
    </group>
  </group>;
}
