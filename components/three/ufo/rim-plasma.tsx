"use client";
import {useEffect,useMemo,useRef,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {DynamicDrawUsage,Group,InstancedMesh,Object3D,Quaternion,ShaderMaterial,Vector3} from "three";
import {createRimBurstResources,easeRimDirection,RIM_BURST_LAYERS,RIM_PORT_COUNT,sampleRimDrive,shouldUpdateRimPlasma} from "./rim-plasma.mjs";

export function RimPlasma({drive,flight,ship,reducedMotion}:{drive:RefObject<{thrust:number;strafe:number;roll?:number;lift:number;turn:number;pitch:number;brake:boolean}>;flight:RefObject<{velocity:Vector3}>;ship:RefObject<Group|null>;reducedMotion:boolean}){
 const shell=useRef<InstancedMesh>(null),core=useRef<InstancedMesh>(null),clock=useRef(0),levels=useRef(new Float32Array(RIM_PORT_COUNT));
 const directions=useRef(Array.from({length:RIM_PORT_COUNT},(_,i)=>new Quaternion().setFromAxisAngle(new Vector3(0,1,0),Math.PI/2-(Math.PI/6+i*Math.PI/3))));
 const resources=useMemo(()=>createRimBurstResources(),[]);
 const scratch=useMemo(()=>({transform:new Object3D(),direction:new Vector3(),forward:new Vector3(0,0,1),velocity:new Vector3(),rotation:new Quaternion(),sample:{x:0,y:0,z:0,dx:0,dy:0,dz:1,strength:0}}),[]);
 useEffect(()=>{
  const outer=shell.current,inner=core.current;
  outer?.instanceMatrix.setUsage(DynamicDrawUsage);inner?.instanceMatrix.setUsage(DynamicDrawUsage);
  return()=>resources.dispose([outer,inner]);
 },[resources]);
 useFrame((state,delta)=>{
  if(!shell.current||!core.current||!ship.current)return;
  if(!shouldUpdateRimPlasma(drive.current,levels.current)){shell.current.visible=false;core.current.visible=false;return;}
  const dt=Math.min(.1,Math.max(0,delta)),{transform,direction,forward,velocity,rotation,sample}=scratch;
  ship.current.getWorldQuaternion(rotation);velocity.copy(flight.current.velocity).applyQuaternion(rotation.invert());
  if(!reducedMotion)clock.current+=dt;
  (shell.current.material as ShaderMaterial).uniforms.uTime.value=reducedMotion?0:clock.current;
  (core.current.material as ShaderMaterial).uniforms.uTime.value=reducedMotion?0:clock.current;
  const alpha=shell.current.geometry.getAttribute("burstAlpha");let alive=false;
  for(let port=0;port<RIM_PORT_COUNT;port++){
   sampleRimDrive(port,drive.current,velocity,sample);
   // Static response under reduced motion; otherwise soften ignition and shutdown.
   levels.current[port]=reducedMotion?sample.strength:levels.current[port]+(sample.strength-levels.current[port])*(1-Math.exp(-(sample.strength>levels.current[port]?8:6)*dt));
   const level=levels.current[port];alive ||=level>.008;
   direction.set(sample.dx,sample.dy,sample.dz);transform.quaternion.setFromUnitVectors(forward,direction);
   easeRimDirection(directions.current[port],transform.quaternion,dt,reducedMotion);
   transform.quaternion.copy(directions.current[port]);direction.copy(forward).applyQuaternion(transform.quaternion);
   for(let layer=0;layer<RIM_BURST_LAYERS;layer++){
    const id=port*RIM_BURST_LAYERS+layer,phase=reducedMotion?(layer+.5)/3:(clock.current*2+layer/3+port*.071)%1;
    const envelope=reducedMotion?.5:Math.sin(Math.PI*phase),width=(.65+.55*level)*(.75+.35*phase),length=(.5+level*.95)*(.65+phase*.45);
    transform.position.set(sample.x,sample.y,sample.z).addScaledVector(direction,phase*.22);
    transform.scale.set(level>.008?width:0,level>.008?width*.5:0,level>.008?length:0);transform.updateMatrix();shell.current.setMatrixAt(id,transform.matrix);
    transform.scale.set(transform.scale.x*.52,transform.scale.y*.52,transform.scale.z*.72);transform.updateMatrix();core.current.setMatrixAt(id,transform.matrix);
    alpha.setX(id,level*envelope);
   }
  }
  for(const mesh of [shell.current,core.current]){mesh.visible=alive;mesh.instanceMatrix.needsUpdate=true;}
  alpha.needsUpdate=true;if(alive&&!reducedMotion)state.invalidate();
 });
 return <group name="rim-plasma-bursts" userData={{noCrashDebris:true}} dispose={null}>
  <instancedMesh ref={shell} visible={false} userData={{noCrashDebris:true}} args={[resources.geometry,resources.shell,RIM_PORT_COUNT*RIM_BURST_LAYERS]} frustumCulled={false}/>
  <instancedMesh ref={core} visible={false} userData={{noCrashDebris:true}} args={[resources.geometry,resources.core,RIM_PORT_COUNT*RIM_BURST_LAYERS]} frustumCulled={false}/>
 </group>;
}
