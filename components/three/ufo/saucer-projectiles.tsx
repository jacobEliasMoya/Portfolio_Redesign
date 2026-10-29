"use client";
import {useCallback,useEffect,useMemo,useRef,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {AdditiveBlending,Color,DynamicDrawUsage,Group,InstancedBufferAttribute,InstancedMesh,Mesh,Object3D,Quaternion,ShaderMaterial,Vector3} from "three";
import {createBlasterEnvelope,createBlasterMaterial,createPlasmaMaterial} from "./plasma-visual.mjs";
import {UFO_WEAPON_MUZZLE} from "./alien-cannon.mjs";
import { firstProjectileHit, getProjectileTarget } from "./projectile-collision.mjs";
import {createWeaponCharge,isFullCharge,plasmaPulse} from "./weapon-charge.mjs";
import {advanceBolts,BOLT_LIFETIME,createBoltPool,launchBolt} from "./projectile-pool.mjs";
import {collectProjectileGravity} from "./projectile-gravity.mjs";
export function SaucerProjectiles({ship,shotsRef,charge,reducedMotion,flight,active,visible,scale,muzzle=UFO_WEAPON_MUZZLE}:{ship:RefObject<Group|null>;shotsRef:RefObject<number[]>;charge:RefObject<ReturnType<typeof createWeaponCharge>>;reducedMotion:boolean;flight:RefObject<{velocity:Vector3}>;active:boolean;visible:boolean;scale:number;muzzle?:readonly number[]}){
 const plasmaShell=useRef<InstancedMesh>(null),plasmaGeometry=useMemo(()=>{const geometry=createBlasterEnvelope();geometry.setAttribute("shotPower",new InstancedBufferAttribute(new Float32Array(24),1).setUsage(DynamicDrawUsage));return geometry;},[]),plasmaMaterial=useMemo(()=>createBlasterMaterial(),[]);
 const chargeMaterial=useMemo(()=>createPlasmaMaterial({instanced:false}),[]);
 useEffect(()=>()=>chargeMaterial.dispose(),[chargeMaterial]);
 useEffect(()=>()=>{plasmaGeometry.dispose();plasmaMaterial.dispose();},[plasmaGeometry,plasmaMaterial]);
 const pool=useRef(createBoltPool()),chargeGlow=useRef<Mesh>(null);
 const collisionTargets=useRef<ReturnType<typeof import("./projectile-collision.mjs").createDestructible>[]>([]);
 const gravitySources=useRef<ReturnType<typeof collectProjectileGravity>>([]),collisionTime=useRef(0);
 const collideSegment=useCallback((bolt:ReturnType<typeof createBoltPool>[number])=>{
  const hit=firstProjectileHit(collisionTargets.current,bolt.previous,bolt.position,collisionTime.current);if(!hit)return false;
  hit.destroy(bolt.power);bolt.position.copy(hit.point);bolt.velocity.set(0,0,0);bolt.impact=true;bolt.age=BOLT_LIFETIME-.22;return true;
 },[]);
 const core=useRef<InstancedMesh>(null),glow=useRef<InstancedMesh>(null),trail=useRef<InstancedMesh>(null);
 const scratch=useMemo(()=>({origin:new Vector3(),rotation:new Quaternion(),transform:new Object3D(),offset:new Vector3(),color:new Color()}),[]);
 useEffect(()=>{for(const mesh of [core.current,glow.current,trail.current,plasmaShell.current])mesh?.instanceMatrix.setUsage(DynamicDrawUsage);},[]);
 useFrame((scene,delta)=>{
  const dt=Math.min(delta,.1),bolts=pool.current;
  if(chargeGlow.current)(chargeGlow.current.material as ShaderMaterial).uniforms.uTime.value=reducedMotion?0:scene.clock.elapsedTime;
  if(!active||!visible){for(const bolt of bolts)bolt.age=BOLT_LIFETIME;shotsRef.current=[];}
  const charging=active&&visible&&charge.current.active&&!!ship.current?.visible;
  if(chargeGlow.current)chargeGlow.current.visible=charging;
  if(!charging&&!shotsRef.current.length&&!bolts.some(b=>b.age<BOLT_LIFETIME)){
   for(const mesh of [core.current,glow.current,trail.current,plasmaShell.current])if(mesh)mesh.visible=false;
   collisionTargets.current.length=0;gravitySources.current.length=0;return;
  }
  const targets=collisionTargets.current;targets.length=0;
  gravitySources.current.length=0;collisionTime.current=scene.clock.elapsedTime;
  if(bolts.some(b=>b.age<BOLT_LIFETIME&&!b.impact)){
   scene.scene.traverse(object=>{const target=getProjectileTarget(object);if(target)targets.push(target);});
   collectProjectileGravity(scene.scene,gravitySources.current);
  }
  advanceBolts(bolts,dt,gravitySources.current,collideSegment);
  if(chargeGlow.current){
   chargeGlow.current.visible=charging;
   if(charging&&ship.current){
    ship.current.updateWorldMatrix(true,false);
    scratch.origin.set(muzzle[0]*scale,muzzle[1]*scale,(muzzle[2]+.16)*scale);ship.current.localToWorld(scratch.origin);
    chargeGlow.current.position.copy(scratch.origin);ship.current.getWorldQuaternion(chargeGlow.current.quaternion);
    const level=charge.current.level(performance.now());
    // Keep the original compact charge orb, with a constant plasma-blue color.
    chargeGlow.current.scale.setScalar(scale*(.18+level*.7)*(isFullCharge(level)?plasmaPulse(scene.clock.elapsedTime,reducedMotion):1));
   }
  }
  if(active&&visible&&shotsRef.current.length>0&&ship.current?.visible){
   ship.current.updateWorldMatrix(true,false);
   scratch.origin.set(muzzle[0]*scale,muzzle[1]*scale,muzzle[2]*scale);ship.current.localToWorld(scratch.origin);
   ship.current.getWorldQuaternion(scratch.rotation);
   const requested=shotsRef.current;shotsRef.current=[];
   for(const power of requested)launchBolt(bolts,scratch.origin,scratch.rotation,flight.current.velocity,power);
  }
  let alive=false;
  for(let i=0;i<bolts.length;i++){
   const b=bolts[i],life=b.age<BOLT_LIFETIME?Math.min(1,(BOLT_LIFETIME-b.age)/.25):0;
   alive ||= life>0;
   const t=scratch.transform;t.position.copy(b.position);t.quaternion.copy(b.rotation);
   const width=scale*life*(1+b.power*.8),length=scale*life*(1+b.power*.45);
   // Crisp traveling pulse: charge changes width/length, with no wobble or breathing.
   plasmaGeometry.getAttribute("shotPower").setX(i,b.power);
   t.scale.set(!b.impact?width:0,!b.impact?width:0,!b.impact?length:0);t.updateMatrix();plasmaShell.current?.setMatrixAt(i,t.matrix);
   scratch.color.set("#e6f7ff");core.current?.setColorAt(i,scratch.color);
   scratch.color.set("#24baff");glow.current?.setColorAt(i,scratch.color);
   scratch.color.set("#7373ff");trail.current?.setColorAt(i,scratch.color);
   if(b.impact){const burst=(scale*(1-life)*2.5+.1)*(1+b.power*2);t.scale.setScalar(burst*life);t.updateMatrix();core.current?.setMatrixAt(i,t.matrix);t.scale.multiplyScalar(1.8);t.updateMatrix();glow.current?.setMatrixAt(i,t.matrix);t.scale.setScalar(0);t.updateMatrix();trail.current?.setMatrixAt(i,t.matrix);continue;}
   scratch.offset.set(0,0,.10*length).applyQuaternion(b.rotation);t.position.add(scratch.offset);
   t.scale.set(.045*width,.045*width,.66*length);t.updateMatrix();core.current?.setMatrixAt(i,t.matrix);
   t.scale.setScalar(0);t.updateMatrix();glow.current?.setMatrixAt(i,t.matrix);
   scratch.offset.set(0,0,-.9*scale).applyQuaternion(b.rotation);t.position.add(scratch.offset);
   t.scale.setScalar(0);t.updateMatrix();trail.current?.setMatrixAt(i,t.matrix);
  }
  plasmaGeometry.getAttribute("shotPower").needsUpdate=true;
  for(const mesh of [core.current,glow.current,trail.current,plasmaShell.current])if(mesh){mesh.visible=alive;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
  if(alive||charging||(active&&shotsRef.current.length>0))scene.invalidate();
 });
 return <group>
  <instancedMesh ref={plasmaShell} args={[plasmaGeometry,plasmaMaterial,24]} frustumCulled={false}/>
  <mesh ref={chargeGlow} visible={false} material={chargeMaterial}><icosahedronGeometry args={[1,2]}/></mesh>
  <instancedMesh ref={core} args={[undefined,undefined,24]} frustumCulled={false}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/></instancedMesh>
  <instancedMesh ref={glow} args={[undefined,undefined,24]} frustumCulled={false}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial color="#ffffff" transparent opacity={.32} blending={AdditiveBlending} depthWrite={false} toneMapped={false}/></instancedMesh>
  <instancedMesh ref={trail} args={[undefined,undefined,24]} frustumCulled={false}><sphereGeometry args={[1,8,4]}/><meshBasicMaterial color="#ffffff" transparent opacity={.16} blending={AdditiveBlending} depthWrite={false} toneMapped={false}/></instancedMesh>
 </group>;
}
