"use client";
import {useEffect,useMemo,useRef} from "react";
import {Color,InstancedMesh,Object3D,Vector3} from "three";
import {createHexagonalEarthGeometry} from "../planet/hexagonal-earth-geometry.mjs";
import {createHexSaucerTiles} from "./hexagonal-saucer-data.mjs";
export function HexagonalHull(){
 const mesh=useRef<InstancedMesh>(null),tiles=useMemo(()=>createHexSaucerTiles(),[]),geometry=useMemo(()=>createHexagonalEarthGeometry(),[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useEffect(()=>{
  if(!mesh.current)return;
  const t=new Object3D(),color=new Color();
  tiles.forEach((tile,i)=>{t.position.set(tile.x,tile.y,tile.z);t.quaternion.setFromUnitVectors(new Vector3(0,1,0),new Vector3(...tile.normal).normalize());t.scale.set(tile.width,tile.depth,tile.width);t.updateMatrix();mesh.current!.setMatrixAt(i,t.matrix);color.setRGB(tile.shade,tile.shade*.99,tile.shade*.97);mesh.current!.setColorAt(i,color);});
  mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;mesh.current.computeBoundingSphere();
 },[tiles]);
 return <instancedMesh ref={mesh} args={[undefined,undefined,tiles.length]}><primitive object={geometry} attach="geometry"/><meshStandardMaterial roughness={.42} metalness={.72} flatShading/></instancedMesh>;
}
