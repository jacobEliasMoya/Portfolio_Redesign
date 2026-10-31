import {Group,Mesh,Plane,Vector3} from "three";
import {hudTextAdvance} from "./hud-letter-geometry.mjs";
import {createHudLetterModel} from "./hud-letter-model.mjs";
const TURN=Math.PI/5,RADIUS=1.6;
export function stepScoreReel(reel,target,delta,reducedMotion=false){
 if(target!==reel.target){
  reel.target=target;
  const remaining=((target-Math.floor(reel.value))%10+10)%10;
  reel.destination=target-reel.previous>20?Math.floor(reel.value)+10+remaining:reel.destination+Math.max(0,target-reel.previous);
  reel.previous=target;
 }
 reel.value=reducedMotion?reel.destination:reel.value+(reel.destination-reel.value)*(1-Math.exp(-9*Math.min(.1,Math.max(0,delta))));
 if(Math.abs(reel.destination-reel.value)<.001)reel.value=reel.destination;
 return reel.value;
}
/** Genuine Sabo volumes arranged around mechanical drums, clipped to a reading slot. */
export function createScoreReels(resources,digits,{color="#50edf1",opacity=1}={}){
 const root=new Group(),prefix=createHudLetterModel(resources,"SCORE: ",{color,opacity});root.add(prefix);
 const planes=[new Plane(new Vector3(0,1,0)),new Plane(new Vector3(0,-1,0))];
 const materials=resources.materials(color,opacity).map(source=>{const material=source.clone();material.clippingPlanes=planes;return material;});
 const advance=Math.max(...Array.from({length:10},(_,i)=>hudTextAdvance(resources.font,String(i)))),start=hudTextAdvance(resources.font,"SCORE: ");
 const reels=Array.from({length:digits},(_,index)=>{
  const drum=new Group();drum.position.x=start+(index+.5)*advance;root.add(drum);
  const meshes=Array.from({length:10},(_,digit)=>{const mesh=new Mesh(resources.geometry(String(digit)),materials);drum.add(mesh);return mesh;});
  return {meshes,value:0,destination:0,target:0,previous:0,place:10**(digits-index-1)};
 });
 return {root,reels,planes,dispose(){materials.forEach(material=>material.dispose());}};
}
export function updateScoreReels(model,score,delta,reducedMotion=false){
 model.root.updateWorldMatrix(true,false);
 model.planes[0].normal.set(0,1,0);model.planes[0].constant=.54;model.planes[0].applyMatrix4(model.root.matrixWorld);
 model.planes[1].normal.set(0,-1,0);model.planes[1].constant=.54;model.planes[1].applyMatrix4(model.root.matrixWorld);
 let moving=false;
 for(const reel of model.reels){
  const value=stepScoreReel(reel,Math.floor(score/reel.place),delta,reducedMotion);
  moving ||=value!==reel.destination;
  for(let digit=0;digit<10;digit++){
   const mesh=reel.meshes[digit],angle=(((value-digit+5)%10+10)%10-5)*TURN;
   mesh.visible=Math.abs(angle)<1.2;
   if(mesh.visible){mesh.position.set(0,Math.sin(angle)*RADIUS,(Math.cos(angle)-1)*RADIUS);mesh.rotation.x=-angle;}
  }
 }
 return moving;
}
