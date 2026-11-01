"use client";
import Link from "next/link";
import {Suspense,useEffect,useMemo,useRef,type CSSProperties} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Html,OrbitControls} from '@react-three/drei';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {Vector3,Group,RectAreaLight} from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import type {OrbitControls as OrbitImpl} from 'three-stdlib';
import fontData from '@/public/fonts/sabo-filled.typeface.json';
import {createSilverOrbit,MONITOR_SCREEN} from './silver-orbit.mjs';
const font=new FontLoader().parse(fontData);
export type ScreenEffect='clean'|'scanlines'|'phosphor'|'amber';
export type MonitorView='showcase'|'front'|'rear'|'left'|'right'|'top'|'bottom'|'screen';
const poses:Record<Exclude<MonitorView,'screen'>,[number,number,number]>={showcase:[5,2,8],front:[0,.3,9],rear:[-6,2.5,-11],left:[-12,1,0],right:[12,1,0],top:[0,12,.001],bottom:[0,-12,.001]};
function Monitor({live,effect,strength}:{live:boolean;effect:ScreenEffect;strength:number}){
 const model=useMemo(()=>createSilverOrbit(font),[]),object=useRef<Group>(model.root);
 useEffect(()=>()=>model.dispose(),[model]);
 const gl=useThree(s=>s.gl),portal=useMemo(()=>({current:gl.domElement.parentElement!}),[gl]);
 const s=MONITOR_SCREEN;
 const glare=useRef<HTMLDivElement>(null),eye=useMemo(()=>new Vector3(),[]),half=useMemo(()=>new Vector3(),[]),center=useMemo(()=>new Vector3(s.x,s.y,s.z),[s.x,s.y,s.z]),light=useMemo(()=>new Vector3(-3,4,5).sub(new Vector3(s.x,s.y,s.z)).normalize(),[s.x,s.y,s.z]);
 useFrame(({camera})=>{
  const element=glare.current;if(!element)return;
  eye.copy(camera.position).sub(center).normalize();half.copy(eye).add(light).normalize();
  const opacity=(.025+.09*Math.pow(Math.max(0,half.z),12)).toFixed(3),x=`${(24+eye.x*18).toFixed(1)}%`;
  if(element.style.opacity!==opacity)element.style.opacity=opacity;
  if(element.style.getPropertyValue('--glare-x')!==x)element.style.setProperty('--glare-x',x);
 });
 return <group><primitive ref={object} object={model.root} dispose={null}/>{live&&<Html portal={portal} transform position={[s.x,s.y,s.z]} distanceFactor={s.width*400/s.pixels} occlude={[object]} style={{width:s.pixels,height:s.pixels*s.height/s.width,background:'#000'}} zIndexRange={[20,0]}>
  <div className="monitor-display-content" data-effect={effect} style={{'--effect-strength':strength} as CSSProperties}><iframe className="monitor-live-screen" src="/" title="Jake’s Space — live monitor screen" allow="fullscreen" tabIndex={0}/><div className="monitor-screen-treatment" aria-hidden="true"/><div ref={glare} className="monitor-screen-glare" aria-hidden="true"/></div>
 </Html>}</group>;
}
function StudioLight(){
 const light=useMemo(()=>{RectAreaLightUniformsLib.init();const source=new RectAreaLight('#e5efff',3.5,4,2);source.position.set(-3,4,5);source.lookAt(0,.85,0);return source;},[]);
 useEffect(()=>()=>light.dispose(),[light]);
 return <primitive object={light} dispose={null}/>;
}
function CameraRig({view,reducedMotion}:{view:MonitorView;reducedMotion:boolean}){
 const controls=useRef<OrbitImpl>(null),motion=useRef(true),destination=useRef(new Vector3()),aim=useRef(new Vector3());
 const {camera,invalidate,size}=useThree();
 useEffect(()=>{if(view==='screen'){
  const s=MONITOR_SCREEN,d=Math.max(s.height,s.width/(size.width/size.height))/(2*Math.tan(35*Math.PI/360))*1.08;
  destination.current.set(0,s.y,s.z+d);aim.current.set(0,s.y,s.z);
 }else{destination.current.fromArray(poses[view]);if(size.width<size.height)destination.current.multiplyScalar(size.height/size.width*.85);aim.current.set(0,.25,0);}
 motion.current=true;invalidate();},[view,size.width,size.height,invalidate]);
 useFrame((_,delta)=>{if(!motion.current||!controls.current)return;const blend=reducedMotion?1:1-Math.exp(-6*Math.min(delta,.1));camera.position.lerp(destination.current,blend);controls.current.target.lerp(aim.current,blend);controls.current.update();if(camera.position.distanceTo(destination.current)<.001){motion.current=false;}else invalidate();});
 return <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping={false} enabled={view!=='screen'} minDistance={4} maxDistance={30} onStart={()=>{motion.current=false;}}/>;
}
export default function MonitorScene({view,live,reducedMotion,effect,strength}:{view:MonitorView;live:boolean;reducedMotion:boolean;effect:ScreenEffect;strength:number}){
 return <Canvas dpr={[1,1.5]} frameloop={live?"always":"demand"} camera={{position:[5,2,8],fov:35,near:.1,far:100}} gl={{antialias:true,alpha:false}} fallback={<p>3D is unavailable. <Link href="/">Open the standard site</Link>.</p>}>
  <color attach="background" args={['#000']}/><StudioLight/><ambientLight intensity={1.5}/><directionalLight position={[-4,7,8]} intensity={3.5}/><directionalLight position={[6,2,4]} intensity={2} color="#bcd8ed"/><directionalLight position={[-4,2,-5]} intensity={3}/>
  <Suspense fallback={null}><Monitor live={live} effect={effect} strength={strength}/></Suspense><CameraRig view={view} reducedMotion={reducedMotion}/>
 </Canvas>;
}

