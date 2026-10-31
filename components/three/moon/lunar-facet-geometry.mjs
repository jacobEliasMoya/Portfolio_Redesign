import {BufferGeometry,Float32BufferAttribute,InstancedBufferAttribute,Quaternion,Vector3} from "three";
import {applyImpactGlow} from "../planet/impact-material.mjs";

/** Six fitted corners per cell keep the original one-draw instancing and debris transforms. */
export function createLunarFacetGeometry(data){
 const geometry=new BufferGeometry(),positions=[],normals=[],corners=[],bottom=[];
 const vertex=(corner,depth,normal)=>{
  const angle=(corner-1)*Math.PI/3;
  positions.push(corner?Math.cos(angle)*.5:0,depth,corner?Math.sin(angle)*.5:0);
  normals.push(...normal);corners.push(corner);bottom.push(depth);
 };
 for(let side=0;side<6;side++){
  const a=side+1,b=(side+1)%6+1,angle=(side+.5)*Math.PI/3,wall=[Math.cos(angle),0,Math.sin(angle)];
  for(const c of [0,b,a])vertex(c,0,[0,1,0]);
  for(const [c,d] of [[a,0],[b,0],[a,-1],[b,0],[b,-1],[a,-1]])vertex(c,d,wall);
 }
 geometry.setAttribute("position",new Float32BufferAttribute(positions,3));geometry.setAttribute("normal",new Float32BufferAttribute(normals,3));
 geometry.setAttribute("lunarCode",new Float32BufferAttribute(corners.flatMap((corner,index)=>[corner,bottom[index]]),2));
 const buffers=Array.from({length:6},()=>new Float32Array(data.sizes.length*3));
 const rotation=new Quaternion(),normal=new Vector3(),point=new Vector3(),center=new Vector3(),up=new Vector3(0,1,0);
 for(let i=0;i<data.sizes.length;i++){
  center.fromArray(data.positions,i*3);normal.fromArray(data.normals,i*3).normalize();rotation.setFromUnitVectors(up,normal).invert();
  const width=data.sizes[i]*data.tileTangentScale,depth=data.sizes[i]*data.tileDepthScale;
  for(let corner=0;corner<6;corner++){
   point.fromArray(data.facetCorners,i*18+corner*3).sub(center).applyQuaternion(rotation);point.set(point.x/width,point.y/depth,point.z/width).toArray(buffers[corner],i*3);
  }
 }
 for(let corner=0;corner<6;corner++)geometry.setAttribute(`lunarPoint${corner}`,new InstancedBufferAttribute(buffers[corner],3));
 // Conservative bound for collision indexing; rendered polygons use their fitted corners.
 geometry.boundingBox=null;geometry.computeBoundingBox();geometry.computeBoundingSphere();
 return geometry;
}

export function applyLunarFacets(shader){
 applyImpactGlow(shader);
 const attributes=Array.from({length:6},(_,i)=>`attribute vec3 lunarPoint${i};`).join("\n");
 const branches=Array.from({length:6},(_,i)=>`${i?"else ":""}if (lunarCode.x < ${i+1.5}) lunarPosition = lunarPoint${i};`).join("\n");
 shader.vertexShader=shader.vertexShader.replace("#include <common>",`#include <common>\nattribute vec2 lunarCode;\n${attributes}`)
  .replace("#include <begin_vertex>",`vec3 lunarPosition = vec3(0.0);\nif (lunarCode.x > 0.5) { ${branches} }\nvec3 transformed = lunarPosition + vec3(0.0, lunarCode.y, 0.0);`);
}
