import {Vector3} from "three";
import {createShipTides,tidalPosition,tidalNormal} from "./ship-tides.mjs";
/** Keep the live instance matrices/damage buffers. Only shader uniforms move each frame. */
export function captureUniverse(scene,point){
 const entries=[],hole={value:point.clone()},reach={value:0},time={value:0},tides=createShipTides();
 scene.traverse(mesh=>{
  if(!mesh.isMesh)return;
  let node=mesh,ship=false,excluded=false;
  while(node){if(node.userData.singularityExcluded)excluded=true;if(node.userData.singularityShip)ship=true;node=node.parent;}
  if(excluded)return;
  const progress={value:0},original=mesh.material;
  const patch=source=>{const material=source.clone(),previous=source.onBeforeCompile;
   material.onBeforeCompile=(shader,renderer)=>{
    previous.call(material,shader,renderer);
    Object.assign(shader.uniforms,{uSingularity:hole,uReach:reach,uCollapse:progress,uCollapseTime:time});
    if(ship)Object.assign(shader.uniforms,{uShipCenter:tides.center,uTidalAxis:tides.axis,uTidalStretch:tides.stretch});
    shader.vertexShader=(ship?"uniform vec3 uShipCenter; uniform vec3 uTidalAxis; uniform float uTidalStretch;\n":"")+"uniform vec3 uSingularity; uniform float uReach; uniform float uCollapse; uniform float uCollapseTime;\n"+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace("#include <project_vertex>",`
     vec4 collapsePosition=vec4(transformed,1.0);
     vec3 fragmentSeed=vec3(0.0);
     #ifdef USE_INSTANCING
      collapsePosition=instanceMatrix*collapsePosition;
      fragmentSeed=instanceMatrix[3].xyz;
     #endif
     collapsePosition=modelMatrix*collapsePosition;
     ${ship?tidalPosition:""}
     vec3 relative=collapsePosition.xyz-uSingularity;
     float distanceToHole=length(relative);
     float pull=uCollapse*(1.0-smoothstep(uReach-3.0,uReach+3.0,distanceToHole));
     float seed=fract(sin(dot(fragmentSeed,vec3(12.9898,78.233,37.719)))*43758.5453);
     float angle=pull*(5.0+seed*1.5);
     mat2 turn=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
     relative.xz=turn*relative.xz;
     relative*=pow(max(0.0,1.0-pull),2.0);
     relative.y+=sin(angle+seed*6.28)*pull*(1.0-pull)*2.0;
     vec4 mvPosition=viewMatrix*vec4(uSingularity+relative,1.0);
     gl_Position=projectionMatrix*mvPosition;
    `);
    if(ship)shader.vertexShader=shader.vertexShader.replace("#include <defaultnormal_vertex>","#include <defaultnormal_vertex>\n"+tidalNormal);
   };
   material.customProgramCacheKey=()=>source.customProgramCacheKey()+(ship?"-live-singularity-tides-v2":"-live-singularity-v1");
   return material;
  };
  mesh.material=Array.isArray(original)?original.map(patch):patch(original);
  const center=new Vector3();mesh.getWorldPosition(center);
  entries.push({mesh,original,progress,ship,center,wasVisible:mesh.visible,culled:mesh.frustumCulled});mesh.frustumCulled=false;
 });
 const extent=Math.max(30,...entries.filter(e=>!e.ship).map(e=>e.center.distanceTo(point)+20));
 return {entries,hole,reach,time,tides,extent,shipCaptureAge:null};
}
export function stepUniverse(capture,age,shipPosition,reducedMotion=false){
 capture.time.value=age;capture.reach.value=Math.min(capture.extent,2+Math.max(0,age)/4*capture.extent);
 for(const entry of capture.entries){
  const progress=entry.ship?(capture.shipCaptureAge===null?0:Math.min(1,Math.max(0,(age-capture.shipCaptureAge)/(reducedMotion?.3:2)))):Math.min(1,.12+Math.max(0,age)/(reducedMotion?.3:4));
  entry.progress.value=progress;
  if(progress===1)entry.mesh.visible=false;
 }
}
export function releaseUniverse(capture){for(const entry of capture.entries){const materials=Array.isArray(entry.mesh.material)?entry.mesh.material:[entry.mesh.material];materials.forEach(m=>m.dispose());entry.mesh.material=entry.original;entry.mesh.visible=entry.wasVisible;entry.mesh.frustumCulled=entry.culled;}}
