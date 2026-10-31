import {Box3,Float32BufferAttribute,Group,Mesh,MeshBasicMaterial,SphereGeometry,Vector3} from "three";
import {createBlasterEnvelope,createBlasterMaterial} from "./plasma-visual.mjs";
import {createDeathRay} from "./death-ray.mjs";
import {createDeathRayModel,updateDeathRayModel} from "./death-ray-model.mjs";

/** Miniatures of the actual gameplay volumes, in the existing foreground scene.
 * These own their GPU resources and never register collisions or firing state. */
export function createHudWeaponModel(weapon){
 if(weapon!=="bolts"&&weapon!=="death-ray")throw new Error(`No model for weapon ${weapon}`);
 const root=new Group(),art=new Group();root.add(art);art.rotation.set(0,Math.PI/2,.28);
 let dispose,rayModel=null;
 if(weapon==="bolts"){
  const geometry=createBlasterEnvelope(),material=createBlasterMaterial({instanced:false});
  geometry.setAttribute("shotPower",new Float32BufferAttribute(new Float32Array(geometry.attributes.position.count).fill(.65),1));
  const shell=new Mesh(geometry,material),coreGeometry=new SphereGeometry(1,8,6),coreMaterial=new MeshBasicMaterial({color:"#e6f7ff",toneMapped:false}),core=new Mesh(coreGeometry,coreMaterial);
  core.scale.set(.045,.045,.66);core.position.z=.1;art.add(shell,core);
  dispose=()=>{geometry.dispose();material.dispose();coreGeometry.dispose();coreMaterial.dispose();};
 }else{
  rayModel=createDeathRayModel();const ray=createDeathRay();
  ray.active=true;ray.held=true;ray.releaseAge=0;ray.length=4;
  updateDeathRayModel(rayModel,ray,1,true);
  // The slot shows just the beam; the gameplay contact flare stays in-world.
  rayModel.root.remove(rayModel.flare);art.add(rayModel.root);dispose=()=>rayModel.dispose();
 }
 root.updateMatrixWorld(true);
 const box=new Box3().setFromObject(root),center=box.getCenter(new Vector3()),size=box.getSize(new Vector3());
 // Preserve the art's rotation; translation centers its transformed volume.
 art.position.sub(center);root.updateMatrixWorld(true);root.name=`HUD ${weapon} miniature`;
 return {root,art,weapon,rayModel,bounds:{width:size.x,height:size.y,depth:size.z},dispose};
}
export function layoutHudWeaponModel(model,rect,viewport){
 const scale=Math.min(rect.width*.84/model.bounds.width,rect.height*.82/model.bounds.height);
 model.root.scale.setScalar(scale);
 model.root.position.set(rect.x-viewport.left+rect.width/2-viewport.width/2,viewport.height/2-(rect.y-viewport.top+rect.height/2),0);
}
export function stepHudWeaponModel(model,elapsed,reducedMotion=false){
 if(model.rayModel)model.rayModel.shellMaterial.uniforms.uAge.value=reducedMotion?0:elapsed;
}
