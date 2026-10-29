"use client";
import {useMemo,useRef} from "react";
import {useFrame,useThree} from "@react-three/fiber";
import {useFBO} from "@react-three/drei";
import {HalfFloatType,LinearFilter,Matrix4,Mesh,OrthographicCamera,ShaderMaterial,Vector3} from "three";
import {discAtlasResolution,lensFragmentShader,lensVertexShader} from "./lensing.mjs";

/** One top-down atlas preserves hex detail before mapping it into secondary disc arcs. */
export function LensingField(){
 const size=useThree(s=>s.size),resolution=discAtlasResolution(size.width,size.height),target=useFBO(resolution,resolution,{type:HalfFloatType,minFilter:LinearFilter,magFilter:LinearFilter,samples:0}),plane=useRef<Mesh>(null),shader=useRef<ShaderMaterial>(null);
 const uniforms=useMemo(()=>({uDisc:{value:target.texture},uAzimuth:{value:0},uArcVisibility:{value:1}}),[target]);
 const atlasCamera=useMemo(()=>new OrthographicCamera(-6.6,6.6,6.6,-6.6,.1,40),[]);
 const vectors=useMemo(()=>({normal:new Vector3(),view:new Vector3(),position:new Vector3(),inverse:new Matrix4()}),[]);
 useFrame(({gl,scene,camera})=>{
  const mesh=plane.current,material=shader.current,disc=scene.getObjectByName("tilted-accretion-disc");if(!mesh||!material||!disc)return;const live=material.uniforms;
  disc.updateWorldMatrix(true,false);disc.getWorldPosition(vectors.position);vectors.normal.set(0,1,0).transformDirection(disc.matrixWorld);
  atlasCamera.position.copy(vectors.position).addScaledVector(vectors.normal,15);atlasCamera.up.set(0,0,-1).transformDirection(disc.matrixWorld);atlasCamera.lookAt(vectors.position);atlasCamera.updateMatrixWorld();
  mesh.position.copy(vectors.position);mesh.quaternion.copy(camera.quaternion);mesh.updateMatrixWorld();
  const shell=scene.getObjectByName("matte-hex-sphere"),visible=shell?.visible,previous=gl.getRenderTarget();mesh.visible=false;if(shell)shell.visible=false;
  const excluded:{object:import("three").Object3D;visible:boolean}[]=[];scene.traverse(object=>{if(object.userData.excludeFromDiscAtlas){excluded.push({object,visible:object.visible});object.visible=false;}});
  try{gl.setRenderTarget(target);gl.clear();gl.render(scene,atlasCamera);}finally{gl.setRenderTarget(previous);mesh.visible=true;if(shell)shell.visible=visible??true;for(const entry of excluded)entry.object.visible=entry.visible;}
  camera.getWorldPosition(vectors.view);vectors.view.sub(vectors.position).normalize();const edgeOn=1-Math.abs(vectors.normal.dot(vectors.view));live.uArcVisibility.value=.35+.65*Math.pow(edgeOn,1.1);
  vectors.inverse.copy(disc.matrixWorld).invert();camera.getWorldPosition(vectors.view);vectors.view.applyMatrix4(vectors.inverse);live.uAzimuth.value=Math.atan2(vectors.view.x,vectors.view.z);
 });
 return <mesh ref={plane} renderOrder={10} frustumCulled={false}>
  <planeGeometry args={[6.4,6.4]}/><shaderMaterial ref={shader} transparent depthWrite={false} depthTest uniforms={uniforms} vertexShader={lensVertexShader} fragmentShader={lensFragmentShader}/>
 </mesh>;
}
