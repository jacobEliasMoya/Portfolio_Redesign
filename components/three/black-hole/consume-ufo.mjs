import {streamDeclarations,streamMotion} from "./consumption-stream.mjs";
import {Float32BufferAttribute,Matrix4,ShaderChunk,Vector3} from "three";
import {createUFOV3,disposeUFOV3} from "../ufo/create-ufo-v3.mjs";

export const CAPTURE_RADIUS=6.3,APPROACH_SPEED=.65,CONSUMPTION_DURATION=3.4;
/** First intersection of a leftward approach with the capture sphere. */
export function releaseTime([x,y,z]){return Math.max(0,(x-Math.sqrt(Math.max(0,CAPTURE_RADIUS**2-y*y-z*z)))/APPROACH_SPEED);}
export function consumptionProgress(time,release){return Math.max(0,Math.min(1,(time-release)/CONSUMPTION_DURATION));}
const common=`
attribute vec3 aFragmentCenter;
attribute float aFragmentIndex;
attribute float aReleaseTime;
uniform float uConsumeTime;
float consumeAge=max(0.0,uConsumeTime-aReleaseTime);
float consumeP=clamp(consumeAge/${CONSUMPTION_DURATION.toFixed(1)},0.0,1.0);
float consumeEase=consumeP*consumeP*(3.0-2.0*consumeP);
float consumeAngle=consumeAge*(1.1+consumeP*2.5);
mat3 consumeRotation=mat3(cos(consumeAngle),0.0,-sin(consumeAngle),0.0,1.0,0.0,sin(consumeAngle),0.0,cos(consumeAngle));
`;
/** Original geometry, with one GPU transform per original armor/mechanical piece. */
export function createConsumedUFO(){
 const root=createUFOV3({fragments:true}),clock={value:0},matrix=new Matrix4().makeRotationZ(.12).scale(new Vector3(.64,.64,.64)).setPosition(8.1,.7,.3),center=new Vector3();
 let endTime=0,pieces=0;const materials=new Set();
 root.name="consumption-ufo";root.userData.excludeFromDiscAtlas=true;
 root.traverse(mesh=>{if(!mesh.isMesh)return;mesh.frustumCulled=false;const g=mesh.geometry,centers=g.getAttribute("aFragmentCenter"),ids=g.getAttribute("aFragmentIndex"),release=new Float32Array(centers.count),seen=new Set();
  g.applyMatrix4(matrix);
  for(let i=0;i<centers.count;i++){center.fromBufferAttribute(centers,i).applyMatrix4(matrix);centers.setXYZ(i,center.x,center.y,center.z);release[i]=releaseTime(center.toArray());endTime=Math.max(endTime,release[i]+CONSUMPTION_DURATION);seen.add(ids.getX(i));}
  if(mesh.parent.name!=="v3-gear")pieces+=seen.size;
  g.setAttribute("aReleaseTime",new Float32BufferAttribute(release,1));materials.add(mesh.material);
 });
 for(const material of materials)applyConsumptionMaterial(material,clock);
 root.userData.consumption={clock,endTime,pieces};return root;
}
export {disposeUFOV3 as disposeConsumedUFO};

export function applyConsumptionMaterial(material,clock,{instanced=false}={}){material.onBeforeCompile=shader=>{shader.uniforms.uConsumeTime=clock;
  // Parameters are local to main so uniforms remain legal GLSL declarations.
  const declarations=common.slice(0,common.indexOf("float consumeAge")),motion=common.slice(common.indexOf("float consumeAge"));
  if(instanced){
   let original=shader.vertexShader;
   for(const name of ["defaultnormal_vertex","project_vertex","worldpos_vertex"])original=original.replace(`#include <${name}>`,ShaderChunk[name].replaceAll("instanceMatrix","consumeInstance"));
   shader.vertexShader=original.replace("void main() {",declarations+streamDeclarations+"\nvoid main() {\n"+motion+`
mat4 consumeInstance=instanceMatrix;
vec3 releaseCenter=aFragmentCenter-vec3(aReleaseTime*${APPROACH_SPEED},0.0,0.0);
vec3 attachedCenter=aFragmentCenter-vec3(min(uConsumeTime,aReleaseTime)*${APPROACH_SPEED},0.0,0.0);
${streamMotion}
consumeInstance[0].xyz=streamSpin*consumeInstance[0].xyz*streamShrink;
consumeInstance[1].xyz=streamSpin*consumeInstance[1].xyz*streamShrink;
consumeInstance[2].xyz=streamSpin*consumeInstance[2].xyz*streamShrink;
consumeInstance[3].xyz=consumeAge>0.0?streamCenter:attachedCenter;
`);
  }else shader.vertexShader=shader.vertexShader.replace("void main() {",declarations+"\nvoid main() {\n"+motion)
   .replace("#include <beginnormal_vertex>","#include <beginnormal_vertex>\nobjectNormal=consumeRotation*objectNormal;")
   .replace("#include <begin_vertex>",`#include <begin_vertex>
vec3 attachedCenter=aFragmentCenter-vec3(min(uConsumeTime,aReleaseTime)*${APPROACH_SPEED},0.0,0.0);
vec3 releaseCenter=aFragmentCenter-vec3(aReleaseTime*${APPROACH_SPEED},0.0,0.0);
float startRadius=length(releaseCenter);
vec3 spiralCenter=consumeRotation*normalize(releaseCenter)*mix(startRadius,1.65,consumeEase);
float shrink=max(.0001,1.0-smoothstep(.70,1.0,consumeP));
vec3 pieceOffset=position-aFragmentCenter;
transformed=consumeAge>0.0?spiralCenter+consumeRotation*pieceOffset*shrink:attachedCenter+pieceOffset;
`);
 };material.customProgramCacheKey=()=>instanced?"black-hole-instanced-consumption-stream-v2":"black-hole-ufo-consumption-v1";}
