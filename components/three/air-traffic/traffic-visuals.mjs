import {Object3D,Vector3} from "three";
import {createTrafficScratch,FLEET_SIZE,PLANE_STYLES,sampleNetworkFlight,TRAIL_PUFFS,TRAIL_STEP} from "./traffic-network.mjs";
export function createTrafficVisualState(){return {scratch:createTrafficScratch(),historyScratch:createTrafficScratch(),pose:new Object3D(),past:new Object3D(),puff:new Object3D(),offset:new Vector3(),lastPositions:Array.from({length:FLEET_SIZE},()=>new Vector3()),deathAges:new Float64Array(FLEET_SIZE).fill(-1)};}
export function setTrafficVisibility(object,trails,enabled,reducedMotion){object.visible=enabled;trails.mesh.visible=enabled&&!reducedMotion;}
export function stepTrafficVisuals(object,trails,network,timeNow,dt,dead,reducedMotion,v){
 const {scratch,historyScratch,pose,past,puff,offset,lastPositions,deathAges}=v;
 for(let i=0;i<FLEET_SIZE;i++){
  const size=PLANE_STYLES[i%3].size,time=timeNow+i*network.total/FLEET_SIZE;
  let leg=-1,hasTrail=false;
  if(!dead.has(i)){
   const phase=sampleNetworkFlight(network,time,pose,scratch,size);leg=phase.index;hasTrail=phase.flying&&phase.progress>.12&&phase.progress<.88&&phase.altitude>.003;
   object.setMatrixAt(i,pose.matrix);lastPositions[i].copy(pose.position);
  }else {if(deathAges[i]<0)deathAges[i]=0;deathAges[i]+=dt;}
  for(let j=0;j<TRAIL_PUFFS;j++){
   let valid=false;
   if(hasTrail&&!reducedMotion){const prior=sampleNetworkFlight(network,time-(j+1)*TRAIL_STEP,past,historyScratch,size);valid=prior.index===leg&&prior.flying&&prior.progress>.1;}
   for(let side=0;side<2;side++){
    const id=(i*TRAIL_PUFFS+j)*2+side,fade=1-j/TRAIL_PUFFS;
    puff.scale.setScalar(0);trails.alpha.setX(id,0);
    if(dead.has(i)&&deathAges[i]<.65&&!reducedMotion){
     const age=deathAges[i],angle=id*2.399;puff.position.copy(lastPositions[i]).add(offset.set(Math.cos(angle),Math.sin(angle),Math.sin(angle*.7)).multiplyScalar(age*.13));puff.scale.setScalar(.018*(1+age*2));trails.alpha.setX(id,(1-age/.65)*.35);
    }else if(valid){
     offset.set((side?1:-1)*.21,-.075,-.2).multiplyScalar(past.scale.x).applyQuaternion(past.quaternion);puff.position.copy(past.position).add(offset).addScaledVector(historyScratch.radial,j*.001);puff.scale.setScalar((.008+j*.0023)*size);trails.alpha.setX(id,fade*.32);
    }
    puff.rotation.set(j*.7,side+j*.3,j*.4);puff.updateMatrix();trails.mesh.setMatrixAt(id,puff.matrix);
   }
  }
 }
 object.instanceMatrix.needsUpdate=true;trails.mesh.instanceMatrix.needsUpdate=true;trails.alpha.needsUpdate=true;
}
