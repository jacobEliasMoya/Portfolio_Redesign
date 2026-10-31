"use client";
import {useMemo,useRef} from "react";
import {useFrame,useThree} from "@react-three/fiber";
import {useFBO} from "@react-three/drei";
import {HalfFloatType,LinearFilter,Matrix4,Mesh,OrthographicCamera,type Group,type Object3D,ShaderMaterial,Vector3} from "three";
import {discAtlasResolution,lensFragmentShader,lensVertexShader} from "./lensing.mjs";

/** One top-down atlas preserves hex detail before mapping it into secondary disc arcs. */
export function LensingField({source}:{source?:Group}={}){
 const size=useThree(s=>s.size),resolution=discAtlasResolution(size.width,size.height),target=useFBO(resolution,resolution,{type:HalfFloatType,minFilter:LinearFilter,magFilter:LinearFilter,samples:0}),plane=useRef<Mesh>(null),shader=useRef<ShaderMaterial>(null);
 const uniforms=useMemo(()=>({uDisc:{value:target.texture},uAzimuth:{value:0},uArcVisibility:{value:1}}),[target]);
 const atlasCamera=useMemo(()=>new OrthographicCamera(-6.6,6.6,6.6,-6.6,.1,40),[]);
 const vectors=useMemo(()=>({normal:new Vector3(),view:new Vector3(),position:new Vector3(),inverse:new Matrix4()}),[]);
 useFrame(({gl,scene,camera})=>{
  const mesh=plane.current,material=shader.current,disc=source?source.getObjectByName("tilted-accretion-disc"):scene.getObjectByName("tilted-accretion-disc");if(!mesh||!material||!disc)return;if(source&&!source.visible){mesh.visible=false;return;}const live=material.uniforms;
  disc.updateWorldMatrix(true,false);disc.getWorldPosition(vectors.position);vectors.normal.set(0,1,0).transformDirection(disc.matrixWorld);
  const scale=disc.matrixWorld.getMaxScaleOnAxis();resizeAtlasCamera(atlasCamera,scale);
  atlasCamera.position.copy(vectors.position).addScaledVector(vectors.normal,15*scale);atlasCamera.up.set(0,0,-1).transformDirection(disc.matrixWorld);atlasCamera.lookAt(vectors.position);atlasCamera.updateMatrixWorld();
  mesh.scale.setScalar(scale);mesh.position.copy(vectors.position);mesh.quaternion.copy(camera.quaternion);mesh.updateMatrixWorld();
  const shell=source?source.getObjectByName("matte-hex-sphere"):scene.getObjectByName("matte-hex-sphere"),visible=shell?.visible,previous=gl.getRenderTarget();mesh.visible=false;if(shell)shell.visible=false;
  const excluded:{object:import("three").Object3D;visible:boolean}[]=[];scene.traverse(object=>{if(object.userData.excludeFromDiscAtlas){excluded.push({object,visible:object.visible});object.visible=false;}});
  // In the live universe, capture only the real accretion bands and lights.
  // Temporary layer masks avoid redrawing terrain or leaking land colors into the arcs.
  const masks:{object:Object3D;mask:number}[]=[];
  if(source){atlasCamera.layers.set(31);disc.traverse(object=>{if(object instanceof Mesh){masks.push({object,mask:object.layers.mask});object.layers.set(31);}});scene.traverse(object=>{if("isLight" in object){masks.push({object,mask:object.layers.mask});object.layers.enable(31);}});}
  try{gl.setRenderTarget(target);gl.clear();gl.render(scene,atlasCamera);}finally{gl.setRenderTarget(previous);for(const entry of masks)entry.object.layers.mask=entry.mask;mesh.visible=true;if(shell)shell.visible=visible??true;for(const entry of excluded)entry.object.visible=entry.visible;}
  camera.getWorldPosition(vectors.view);vectors.view.sub(vectors.position).normalize();const edgeOn=1-Math.abs(vectors.normal.dot(vectors.view));live.uArcVisibility.value=(.35+.65*Math.pow(edgeOn,1.1))*(source?.userData.materializationProgress??1);
  vectors.inverse.copy(disc.matrixWorld).invert();camera.getWorldPosition(vectors.view);vectors.view.applyMatrix4(vectors.inverse);live.uAzimuth.value=Math.atan2(vectors.view.x,vectors.view.z);
 });
 return <mesh ref={plane} renderOrder={10} frustumCulled={false}>
  <planeGeometry args={[6.4,6.4]}/><shaderMaterial ref={shader} transparent depthWrite={false} depthTest uniforms={uniforms} vertexShader={lensVertexShader} fragmentShader={lensFragmentShader}/>
 </mesh>;
}

function resizeAtlasCamera(camera:OrthographicCamera,scale:number){camera.left=-6.6*scale;camera.right=6.6*scale;camera.top=6.6*scale;camera.bottom=-6.6*scale;camera.far=Math.max(40,40*scale);camera.updateProjectionMatrix();}
