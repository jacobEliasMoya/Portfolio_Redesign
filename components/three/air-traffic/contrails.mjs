import {DynamicDrawUsage,IcosahedronGeometry,InstancedBufferAttribute,InstancedMesh,MeshBasicMaterial} from "three";
export function createContrails(count){
 const geometry=new IcosahedronGeometry(1,0),alpha=new InstancedBufferAttribute(new Float32Array(count),1).setUsage(DynamicDrawUsage);geometry.setAttribute("trailAlpha",alpha);
 const material=new MeshBasicMaterial({color:"#dce5e9",transparent:true,depthWrite:false,toneMapped:false});
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace("#include <common>","#include <common>\nattribute float trailAlpha;varying float vTrailAlpha;").replace("#include <begin_vertex>","#include <begin_vertex>\nvTrailAlpha=trailAlpha;");
  shader.fragmentShader=shader.fragmentShader.replace("#include <common>","#include <common>\nvarying float vTrailAlpha;").replace("#include <color_fragment>","#include <color_fragment>\ndiffuseColor.a*=vTrailAlpha;");
 };
 material.customProgramCacheKey=()=>"mini-plane-contrails-v1";
 const mesh=new InstancedMesh(geometry,material,count);mesh.name="Mini-plane cloud trails";mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(DynamicDrawUsage);mesh.visible=false;
 return {mesh,alpha,dispose(){mesh.dispose();geometry.dispose();material.dispose();}};
}
