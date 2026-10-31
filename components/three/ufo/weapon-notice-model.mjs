import {BoxGeometry,Color,DynamicDrawUsage,Group,InstancedMesh,MeshStandardMaterial,Object3D} from "three";
import {hudTextAdvance} from "./hud-letter-geometry.mjs";
export const WEAPON_NOTICE_SECONDS=2.25,WEAPON_NOTICE_REDUCED_SECONDS=1.6;
const HOLD=1.05,RELEASE=.55,LIFE=.65,CELL=.07;
const noise=index=>{const value=Math.sin(index*127.1+311.7)*43758.5453;return value-Math.floor(value);};
function inside(x,y,points){
 let result=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j];
  if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)result=!result;
 }return result;
}

/** Overlapping micro-cubes sampled from the actual Sabo contours, including
 * counters. A formed word becomes its own drifting 3D particles in one draw. */
export function createWeaponNoticeModel(font,text,{color="#50edf1",fontSize=14}={}){
 const shapes=font.generateShapes(text,1).map(shape=>shape.extractPoints(2));
 const points=shapes.flatMap(shape=>shape.shape),minX=Math.min(...points.map(point=>point.x)),maxX=Math.max(...points.map(point=>point.x));
 const minY=Math.min(...points.map(point=>point.y)),maxY=Math.max(...points.map(point=>point.y));
 const caps=font.generateShapes("H",1).flatMap(shape=>shape.getPoints().map(point=>point.y)),capCenter=(Math.min(...caps)+Math.max(...caps))/2;
 const width=hudTextAdvance(font,text),particles=[];
 for(let y=minY+CELL/2;y<maxY;y+=CELL)for(let x=minX+CELL/2;x<maxX;x+=CELL){
  if(!shapes.some(shape=>inside(x,y,shape.shape)&&!shape.holes.some(hole=>inside(x,y,hole))))continue;
  const index=particles.length;
  particles.push({x:x-minX-width/2,y:y-capCenter,z:0,delay:noise(index+3)*RELEASE,
   vx:(noise(index+5)-.5)*2.8,vy:.8+noise(index+7)*1.1,vz:(noise(index+11)-.5)*.8,
   spinX:(noise(index+13)-.5)*7,spinY:(noise(index+17)-.5)*7,spinZ:(noise(index+19)-.5)*7});
 }
 const root=new Group(),art=new Group(),geometry=new BoxGeometry(1,1,1);
 const material=new MeshStandardMaterial({color,emissive:color,emissiveIntensity:.12,roughness:.8,toneMapped:false});
 const tiles=new InstancedMesh(geometry,material,particles.length),transform=new Object3D(),tint=new Color();
 tiles.instanceMatrix.setUsage(DynamicDrawUsage);tiles.frustumCulled=false;
 particles.forEach((particle,index)=>{
  transform.position.set(particle.x,particle.y,0);transform.scale.setScalar(CELL*1.12);transform.updateMatrix();tiles.setMatrixAt(index,transform.matrix);
  tint.setScalar(.8+noise(index+23)*.2);tiles.setColorAt(index,tint);
 });
 art.add(tiles);root.add(art);root.scale.setScalar(fontSize);root.visible=false;root.name=`Weapon notice: ${text}`;
 const initialMatrices=tiles.instanceMatrix.array.slice();
 return {root,art,tiles,particles,transform,geometry,material,initialMatrices,text,width,lastAge:-1,
  dispose(){geometry.dispose();material.dispose();tiles.dispose();}};
}
export function resetWeaponNoticeModel(model){
 model.tiles.instanceMatrix.array.set(model.initialMatrices);model.tiles.instanceMatrix.needsUpdate=true;
 model.root.visible=true;model.lastAge=-1;
}
export function updateWeaponNoticeModel(model,age,reducedMotion=false){
 const visible=age>=0&&age<(reducedMotion?WEAPON_NOTICE_REDUCED_SECONDS:WEAPON_NOTICE_SECONDS);
 model.root.visible=visible;if(!visible)return false;
 const t=Math.max(0,Math.min(1,age/.18)),back=1+2.70158*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2);
 model.art.scale.setScalar(reducedMotion?1:.86+.14*back);model.art.position.y=reducedMotion?0:-.5*Math.pow(1-t,2);
 if(reducedMotion||age<=HOLD||model.lastAge===age)return true;
 model.lastAge=age;
 const transform=model.transform;
 model.particles.forEach((particle,index)=>{
  const flight=Math.max(0,age-HOLD-particle.delay),remaining=Math.max(0,1-flight/LIFE);
  transform.position.set(particle.x+particle.vx*flight,particle.y+particle.vy*flight+.4*flight*flight,particle.vz*flight);
  transform.rotation.set(particle.spinX*flight,particle.spinY*flight,particle.spinZ*flight);
  transform.scale.setScalar(CELL*1.12*Math.pow(remaining,1.4));transform.updateMatrix();model.tiles.setMatrixAt(index,transform.matrix);
 });
 model.tiles.instanceMatrix.needsUpdate=true;return true;
}
