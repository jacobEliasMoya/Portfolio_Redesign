import {CylinderGeometry,ExtrudeGeometry,Shape,Group,Mesh,MeshStandardMaterial} from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {createHexLoft} from "./ufo-v3-geometry.mjs";

// Model-space +Z emitter, just beyond the three focusing jaws.
export const UFO_WEAPON_MUZZLE=Object.freeze([0,-.10,2.88]);
export const V3_WEAPON_MUZZLE=UFO_WEAPON_MUZZLE;
export const CANNON_ROTATION_SPEED=.9;
/** Rotate around the offset +Z bore, preserving its position and forward direction. */
export function stepCannonRotation(rotor,delta,reducedMotion=false){
 if(!rotor||reducedMotion)return false;
 rotor.rotation.z=(rotor.rotation.z+Math.max(0,Math.min(.1,delta))*CANNON_ROTATION_SPEED)%(Math.PI*2);
 const angle=rotor.rotation.z;
 rotor.position.set(-.10*Math.sin(angle),-.10+.10*Math.cos(angle),0);
 return true;
}

/** Fixed ventral emitter: embedded hex saddle, real recessed throat and three swept jaws. */
export function addAlienCannon(add,{metal,dark,trim,cyan},addRotor=add){
 // A .16-unit forward shift keeps the saddle embedded, while exposing more of the jaws.
 const shift=.16,place=(geometry,material,position=[0,0,0],rotation=[0,0,0],spinning=false)=>(spinning?addRotor:add)(geometry,material,[position[0],position[1],position[2]+shift],rotation);
 const center=[0,-.10,2.08],forward=[Math.PI/2,0,0];
 // Rear saddle overlaps the sealed rim; hollow forward collar reveals a dark throat.
 place(createHexLoft([[0,-.46],[.25,-.46],[.34,-.28],[.32,.06],[.24,.25],[.145,.25],[.145,-.30],[0,-.30]]),dark,center,forward);
 place(createHexLoft([[.31,-.22],[.35,-.14],[.33,-.04],[.29,.04],[.26,.04],[.27,-.22]],true),metal,center,forward);
 place(createHexLoft([[.21,.23],[.23,.27],[.20,.30],[.145,.30],[.145,.23]],true),trim,center,forward);
 // After the forward shift: aperture Z=2.50, collar Z=2.54, open jaws Z=2.80.
 place(new CylinderGeometry(.135,.135,.018,12),dark,[0,-.10,2.31],forward);
 place(new CylinderGeometry(.09,.09,.014,6),cyan,[0,-.10,2.34],forward);
 const jawShape=new Shape();jawShape.moveTo(.19,-.32);jawShape.lineTo(.35,-.24);jawShape.lineTo(.42,.09);jawShape.lineTo(.31,.56);jawShape.lineTo(.20,.56);jawShape.lineTo(.27,.08);jawShape.closePath();
 for(const angle of [Math.PI/6,Math.PI*5/6,Math.PI*3/2]){
  const jaw=new ExtrudeGeometry(jawShape,{depth:.10,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.012,bevelThickness:.012});
  jaw.translate(0,0,-.05);jaw.rotateX(Math.PI/2);
  place(jaw,metal,center,[0,0,angle],true);
  // Three restrained energy seams run along the jaws without extra light sources.
  place(createHexLoft([[0,-.015],[.025,-.015],[.025,.015],[0,.015]]),cyan,[Math.cos(angle)*.30,-.10+Math.sin(angle)*.30,2.42],forward,true);
 }
}

/** Four fixed material batches plus two rotating jaw batches; same geometry on every saucer. */
export function createAlienCannonModel(){
 const root=new Group(),rotor=new Group();root.name="alien-cannon";rotor.name="alien-cannon-rotor";
 const materials={metal:new MeshStandardMaterial({color:"#969b94",metalness:.64,roughness:.43}),dark:new MeshStandardMaterial({color:"#18252a",metalness:.4,roughness:.64}),trim:new MeshStandardMaterial({color:"#646e70",metalness:.7,roughness:.37}),cyan:new MeshStandardMaterial({color:"#75eef4",emissive:"#19cbd5",emissiveIntensity:1.1,roughness:.28})};
 const buckets=new Map();
 const append=(parent)=>(geometry,material,position,rotation)=>{
  const mesh=new Mesh(geometry,material);mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.updateMatrix();
  const transformed=geometry.clone().applyMatrix4(mesh.matrix),part=transformed.index?transformed.toNonIndexed():transformed;
  if(part!==transformed)transformed.dispose();geometry.dispose();
  if(!buckets.has(parent))buckets.set(parent,new Map());const materials=buckets.get(parent);
  if(!materials.has(material))materials.set(material,[]);materials.get(material).push(part);
 };
 addAlienCannon(append(root),materials,append(rotor));
 for(const [parent,materials] of buckets)for(const [material,parts] of materials){parent.add(new Mesh(mergeGeometries(parts),material));parts.forEach(part=>part.dispose());}
 root.add(rotor);
 return root;
}
export function disposeAlienCannonModel(root){const materials=new Set();root.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();materials.add(mesh.material);}});materials.forEach(material=>material.dispose());}
