"use client";
import {useEffect,useMemo,useRef,useSyncExternalStore} from "react";
import {createPortal,useFrame,useThree} from "@react-three/fiber";
import {Scene} from "three";
import type {Mesh,PlaneGeometry,MeshBasicMaterial} from "three";
import {createGuideBoardState} from "./guide-board-state.mjs";
import {createGuideBoardModel,updateGuideBoardModel} from "./guide-board-model.mjs";
import {createGuideBoardCamera,resizeGuideBoardCamera,renderGuideBoardLayer} from "./guide-board-projection.mjs";
type Board=ReturnType<typeof createGuideBoardState>;
export function GuideBoard({board}:{board:Board}){
 const phase=useSyncExternalStore(board.subscribe,board.getSnapshot,board.getSnapshot);
 const layout=useSyncExternalStore(board.subscribe,board.getLayout,board.getLayout);
 const {size,gl,scene,camera,invalidate}=useThree();
 const boardScene=useMemo(()=>new Scene(),[]),boardCamera=useMemo(()=>createGuideBoardCamera(),[]);
 const shade=useRef<Mesh<PlaneGeometry,MeshBasicMaterial>>(null);
 const model=useMemo(()=>createGuideBoardModel(layout.width+24,layout.height+24),[layout.width,layout.height]);
 useEffect(()=>()=>model.dispose(),[model]);
 useEffect(()=>board.subscribeFrame(invalidate),[board,invalidate]);
 useFrame(()=>{
  if(phase==="closed")return;
  const frame=board.getFrame(),rect=gl.domElement.getBoundingClientRect();
  resizeGuideBoardCamera(boardCamera,size.width,size.height);
  if(shade.current)shade.current.material.opacity=.6*Math.min(1,frame.progress*5);
  model.root.position.set(layout.x-rect.left-size.width/2,size.height/2-(layout.y-rect.top),0);
  updateGuideBoardModel(model,frame.progress,boardCamera.position.z);
 });
 // Positive priority owns this foreground canvas's render only. The heavy
 // world canvas and the native dialog retain their existing owners.
 useFrame(()=>renderGuideBoardLayer(gl,scene,camera,boardScene,boardCamera,phase!=="closed"),1);
 return <group visible={phase!=="closed"}>
  <mesh ref={shade} position={[0,0,30]} renderOrder={1000}><planeGeometry args={[size.width,size.height]}/><meshBasicMaterial color="#000000" transparent opacity={.6} depthWrite={false} toneMapped={false}/></mesh>
  {createPortal(<><ambientLight intensity={1.1}/><directionalLight position={[-200,300,400]} intensity={2.4}/><directionalLight position={[200,-100,100]} intensity={.6}/><primitive object={model.root} dispose={null}/></>,boardScene,{camera:boardCamera})}
 </group>;
}
