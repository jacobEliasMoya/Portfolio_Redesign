"use client";
import {useEffect,useRef,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {Color,DynamicDrawUsage,InstancedBufferAttribute,InstancedMesh,Object3D,Vector3} from "three";
import {getProjectileTarget} from "../ufo/projectile-collision.mjs";
import {createSmokeRing,smokePuff,SMOKE_PUFFS,SMOKE_RING_SLOTS} from "./impact-smoke.mjs";
export function ImpactSmoke({earth,reducedMotion,surfaceRadius=3,kind="earth"}:{earth:RefObject<InstancedMesh|null>;reducedMotion:boolean;surfaceRadius?:number;kind?:"earth"|"moon"}){
 const mesh=useRef<InstancedMesh>(null),rings=useRef<Array<ReturnType<typeof createSmokeRing>|null>>(Array(SMOKE_RING_SLOTS).fill(null)),seen=useRef(0),slot=useRef(0);
 const scratch=useRef({transform:new Object3D(),position:new Vector3(),color:new Color(),puff:{scale:0,alpha:0}});
 useEffect(()=>{if(!mesh.current)return;mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);mesh.current.geometry.setAttribute("smokeAlpha",new InstancedBufferAttribute(new Float32Array(SMOKE_RING_SLOTS*SMOKE_PUFFS),1));},[]);
 useFrame((state,delta)=>{
  if(!mesh.current||!earth.current)return;
  const target=getProjectileTarget(earth.current);if(!target)return;
  while(seen.current<target.impactMarks.length){const mark=target.impactMarks[seen.current++];if(!reducedMotion){rings.current[slot.current]=createSmokeRing(mark,surfaceRadius,kind);slot.current=(slot.current+1)%SMOKE_RING_SLOTS;}}
  if(!rings.current.some(Boolean)){mesh.current.visible=false;return;}
  const alpha=mesh.current.geometry.getAttribute("smokeAlpha");if(!alpha)return;
  let active=false;const {transform,position,color}=scratch.current;
  for(let s=0;s<SMOKE_RING_SLOTS;s++){
   const ring=rings.current[s];if(ring)ring.age+=Math.min(delta,.1);
   const live=!!ring&&ring.age<ring.life&&!reducedMotion&&target.planetPhase()!=="gone";
   active ||=live;
   for(let i=0;i<SMOKE_PUFFS;i++){
    const id=s*SMOKE_PUFFS+i;
    if(live&&ring){const puff=smokePuff(ring,i,position,scratch.current.puff);transform.position.copy(position);transform.rotation.set(i*.71+ring.age*(ring.kind==="moon"?1.2:.18),i*1.37,i*.42);transform.scale.setScalar(puff.scale);alpha.setX(id,puff.alpha);const shade=(ring.kind==="moon"?.40:.18)+(i%7)*.018;color.setRGB(shade,shade*(ring.kind==="moon"?1:.96),shade*(ring.kind==="moon"?1:.92));mesh.current.setColorAt(id,color);}
    else {transform.scale.setScalar(0);alpha.setX(id,0);}
    transform.updateMatrix();mesh.current.setMatrixAt(id,transform.matrix);
   }
   if(!live)rings.current[s]=null;
  }
  mesh.current.visible=active;mesh.current.instanceMatrix.needsUpdate=true;alpha.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
  if(active)state.invalidate();
 });
 return <instancedMesh ref={mesh} visible={false} args={[undefined,undefined,SMOKE_RING_SLOTS*SMOKE_PUFFS]} frustumCulled={false}>
  <icosahedronGeometry args={[1,1]}/><meshStandardMaterial transparent depthWrite={false} roughness={1} onBeforeCompile={shader=>{
   shader.vertexShader=shader.vertexShader.replace("#include <common>","#include <common>\nattribute float smokeAlpha; varying float vSmokeAlpha;").replace("#include <begin_vertex>","#include <begin_vertex>\nvSmokeAlpha=smokeAlpha;");
   shader.fragmentShader=shader.fragmentShader.replace("#include <common>","#include <common>\nvarying float vSmokeAlpha;").replace("#include <color_fragment>","#include <color_fragment>\ndiffuseColor.a*=vSmokeAlpha;");
  }} customProgramCacheKey={()=>"impact-smoke-v1"}/>
 </instancedMesh>;
}
