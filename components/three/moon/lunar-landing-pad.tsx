"use client";
import {useRef,useEffect,useMemo,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {Color,Group,InstancedMesh,MeshBasicMaterial,MeshStandardMaterial,Object3D} from "three";
import {createHexagonalEarthGeometry} from "../planet/hexagonal-earth-geometry.mjs";
import {getProjectileTarget} from "../ufo/projectile-collision.mjs";
import {alignLunarPad,createLunarPadPose,LUNAR_PAD_HEIGHT,LUNAR_PAD_SCALE} from "./lunar-pad-pose.mjs";
export function LunarLandingPad({moon}:{moon:RefObject<InstancedMesh|null>}){
 const beacons=useRef<Group>(null),posts=useRef<InstancedMesh>(null),lamps=useRef<InstancedMesh>(null),halos=useRef<InstancedMesh>(null),brightness=useRef(0);
 const root=useRef<Group>(null),tiles=useRef<InstancedMesh>(null),geometry=useMemo(()=>createHexagonalEarthGeometry(),[]);
 const pose=useMemo(()=>createLunarPadPose(),[]);
 // Run after Moon motion/drag, before the ship samples the launch/landing pose.
 useFrame(()=>{if(root.current)alignLunarPad(root.current,pose);},-1.25);
 const points=useMemo(()=>{const p=[];for(let row=-4;row<=4;row++)for(let col=-4;col<=4;col++){const x=(col+(Math.abs(row)%2)*.5)*.142,z=row*.1065;if(Math.hypot(x,z)<.44)p.push([x,z]);}return p;},[]);
 useEffect(()=>{const t=new Object3D(),color=new Color();points.forEach(([x,z],i)=>{t.position.set(x,.036,z);t.scale.set(.148,.014,.148);t.updateMatrix();tiles.current?.setMatrixAt(i,t.matrix);const gray=.10+(i%5)*.012;color.setRGB(gray,gray*1.05,gray*1.08);tiles.current?.setColorAt(i,color);});if(tiles.current){tiles.current.instanceMatrix.needsUpdate=true;if(tiles.current.instanceColor)tiles.current.instanceColor.needsUpdate=true;}return()=>geometry.dispose();},[geometry,points]);
 useEffect(()=>{const t=new Object3D();for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.sin(a)*.54,z=Math.cos(a)*.54;t.position.set(x,.07,z);t.updateMatrix();posts.current?.setMatrixAt(i,t.matrix);t.position.y=.119;t.updateMatrix();lamps.current?.setMatrixAt(i,t.matrix);t.position.y=.134;t.rotation.x=-Math.PI/2;t.updateMatrix();halos.current?.setMatrixAt(i,t.matrix);t.rotation.x=0;}for(const mesh of [posts.current,lamps.current,halos.current])if(mesh)mesh.instanceMatrix.needsUpdate=true;},[]);
 useFrame((state,delta)=>{
  if(!root.current||!moon.current)return;
  const phase=getProjectileTarget(moon.current)?.planetPhase();root.current.visible=phase!=="exploding"&&phase!=="gone";root.current.userData.launchAvailable=root.current.visible;
  const eligible=state.scene.getObjectByName("piloted-saucer")?.userData.landingEligible===true&&root.current.visible;
  const target=eligible?1:0;brightness.current+=(target-brightness.current)*(1-Math.exp(-7*Math.min(delta,.1)));
  if(beacons.current)beacons.current.position.y=-.105*(1-brightness.current);
  if(lamps.current){const material=lamps.current.material as MeshStandardMaterial;material.emissiveIntensity=brightness.current*3;material.color.setRGB(.06+brightness.current*.32,.12+brightness.current*.78,.14+brightness.current*.66);}
  if(halos.current){halos.current.visible=brightness.current>.01;(halos.current.material as MeshBasicMaterial).opacity=brightness.current*.32;}
  if(Math.abs(target-brightness.current)>.001)state.invalidate();
 });
 return <group ref={root} name="lunar-launch-pad" position={[0,LUNAR_PAD_HEIGHT,0]} scale={LUNAR_PAD_SCALE}>
  {[0,1,2].map(index=>{const angle=index*Math.PI*2/3;return <mesh key={`support-${index}`} position={[Math.sin(angle)*.3,-.4,Math.cos(angle)*.3]}><cylinderGeometry args={[.036,.052,.6,6]}/><meshStandardMaterial color="#30383b" roughness={.9} metalness={.15}/></mesh>;})}
  <group ref={beacons} position={[0,-.105,0]}>
  <instancedMesh ref={posts} args={[undefined,undefined,6]}><cylinderGeometry args={[.015,.022,.08,6]}/><meshStandardMaterial color="#4b5558" roughness={.8} metalness={.3}/></instancedMesh>
  <instancedMesh ref={lamps} args={[undefined,undefined,6]}><cylinderGeometry args={[.022,.022,.025,6]}/><meshStandardMaterial color="#153038" emissive="#45ffcf" emissiveIntensity={0} toneMapped={false}/></instancedMesh>
  <instancedMesh ref={halos} visible={false} args={[undefined,undefined,6]}><ringGeometry args={[.023,.047,12]}/><meshBasicMaterial color="#68ffdc" transparent opacity={0} depthWrite={false} toneMapped={false}/></instancedMesh>
  </group>
  <mesh position={[0,-.04,0]}><cylinderGeometry args={[.56,.59,.12,6]}/><meshStandardMaterial color="#30383b" roughness={.9} metalness={.15}/></mesh>
  <mesh position={[0,.024,0]}><cylinderGeometry args={[.535,.535,.012,6]}/><meshStandardMaterial color="#43494a" roughness={.94}/></mesh>
  <instancedMesh ref={tiles} args={[geometry,undefined,points.length]}><meshStandardMaterial roughness={.95} metalness={.12}/></instancedMesh>
  {Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return <group key={i} rotation={[0,a,0]}>
   <mesh position={[0,-.018,.496]}><boxGeometry args={[.10,.022,.014]}/><meshStandardMaterial color="#66e8ef" emissive="#1cbacb" emissiveIntensity={1.1}/></mesh>
   <mesh position={[0,.033,.28]} rotation={[0,Math.PI/6,0]}><boxGeometry args={[.012,.004,.37]}/><meshStandardMaterial color="#242b2e" roughness={1}/></mesh>
  </group>;})}
  {[0,1,2].map(i=>{const a=i*Math.PI*2/3;return <mesh key={i} position={[Math.sin(a)*.30625,.048,Math.cos(a)*.30625]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.025,.035,6]}/><meshBasicMaterial color="#60dbe4"/></mesh>;})}
 </group>;
}
