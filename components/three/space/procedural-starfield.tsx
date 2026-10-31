"use client";
import {useEffect,useMemo,useRef} from "react";
import {useThree} from "@react-three/fiber";
import {BufferGeometry,Float32BufferAttribute,InstancedMesh,Object3D,Color,ShaderMaterial} from "three";
import {buildStarfield} from "./starfield-data.mjs";
/** Static stars in world space: all parallax comes from camera travel, not animation. */
export function ProceduralStarfield(){
 const data=useMemo(()=>buildStarfield(),[]),accents=useRef<InstancedMesh>(null);
 const height=useThree(s=>s.size.height),dpr=useThree(s=>s.viewport.dpr);
 const materialRef=useRef<ShaderMaterial>(null);
 const uniforms=useMemo(()=>({pixelHeight:{value:1}}),[]);
 useEffect(()=>{if(materialRef.current)materialRef.current.uniforms.pixelHeight.value=height*dpr;},[height,dpr]);
 const geometry=useMemo(()=>{
  const result=new BufferGeometry();
  result.setAttribute("position",new Float32BufferAttribute(data.points.flatMap(star=>star.position),3));
  result.setAttribute("starSize",new Float32BufferAttribute(data.points.map(star=>star.size),1));
  result.setAttribute("starColor",new Float32BufferAttribute(data.points.flatMap(star=>star.color),3));
  result.computeBoundingSphere();return result;
 },[data]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useEffect(()=>{
  if(!accents.current)return;const transform=new Object3D(),color=new Color();
  data.accents.forEach((star,i)=>{
   transform.position.fromArray(star.position);transform.rotation.set(i*.71,i*.37,i*.23);transform.scale.setScalar(star.size);transform.updateMatrix();accents.current!.setMatrixAt(i,transform.matrix);
   color.setRGB(star.color[0]*1.2,star.color[1]*1.2,star.color[2]*1.2);accents.current!.setColorAt(i,color);
  });
  accents.current.instanceMatrix.needsUpdate=true;if(accents.current.instanceColor)accents.current.instanceColor.needsUpdate=true;accents.current.computeBoundingSphere();
 },[data]);
 return <group>
  <points frustumCulled={false}>
   <primitive object={geometry} attach="geometry"/>
   <shaderMaterial ref={materialRef} uniforms={uniforms} depthWrite={false} toneMapped={false}
    vertexShader={`attribute float starSize;attribute vec3 starColor;uniform float pixelHeight;varying vec3 vStarColor;void main(){vStarColor=min(starColor*1.2,vec3(1.0));vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=mv.z<0.0?clamp(starSize*pixelHeight*0.5*projectionMatrix[1][1]/max(1.0,-mv.z),1.25,4.5):0.0;}`}
    fragmentShader={`varying vec3 vStarColor;void main(){gl_FragColor=vec4(vStarColor,1.0);}`}/>
  </points>
  <instancedMesh ref={accents} args={[undefined,undefined,data.accents.length]}>
   <octahedronGeometry args={[1,0]}/><meshBasicMaterial vertexColors toneMapped={false}/>
  </instancedMesh>
 </group>;
}
