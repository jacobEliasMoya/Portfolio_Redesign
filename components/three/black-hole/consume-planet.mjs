import {streamSeeds} from "./consumption-stream.mjs";
import {Color,Group,InstancedBufferAttribute,InstancedMesh,Mesh,MeshStandardMaterial,Object3D,Quaternion,SphereGeometry,SRGBColorSpace,Vector3} from "three";
import {createHexagonalEarthGeometry} from "../planet/hexagonal-earth-geometry.mjs";
import {applyConsumptionMaterial,APPROACH_SPEED,CONSUMPTION_DURATION,releaseTime} from "./consume-ufo.mjs";

/** Reuse every map/survey tile, with static instance data and GPU-only peeling. */
export function createConsumedPlanet(data,kind){
 if(!["earth","moon"].includes(kind))throw new Error("Unknown consumption target");
 const count=data.sizes?.length;
 if(!count||count>60000||![data.positions,data.normals,data.colors].every(a=>Array.isArray(a)&&a.length===count*3&&a.every(Number.isFinite))||!data.sizes.every(v=>Number.isFinite(v)&&v>0)||data.radius!==(kind==="earth"?3:.82))throw new Error("Invalid planet consumption asset");
 const root=new Group(),geometry=createHexagonalEarthGeometry(),material=new MeshStandardMaterial({roughness:kind==="earth"?.58:.88,metalness:kind==="earth"?.08:.02}),tiles=new InstancedMesh(geometry,material,count),clock={value:0};
 const radius=kind==="earth"?1.55:1.1,scale=radius/data.radius,transform=new Object3D(),normal=new Vector3(),up=new Vector3(0,1,0),color=new Color(),offset=new Vector3(8.1,.7,.3),orientation=new Quaternion().setFromAxisAngle(up,kind==="earth"?Math.PI/2:0),centers=new Float32Array(count*3),releases=new Float32Array(count),ids=new Float32Array(count),seeds=new Float32Array(count*3);
 let first=Infinity,last=0;
 for(let i=0;i<count;i++){
  normal.fromArray(data.normals,i*3).normalize();transform.quaternion.setFromUnitVectors(up,normal).premultiply(orientation);
  transform.position.fromArray(data.positions,i*3).applyQuaternion(orientation).multiplyScalar(scale).add(offset);
  const width=kind==="earth"?1.4:1.65,size=data.sizes[i]*scale;transform.scale.set(size*width,size*1.15,size*width);transform.updateMatrix();tiles.setMatrixAt(i,transform.matrix);
  color.setRGB(data.colors[i*3],data.colors[i*3+1],data.colors[i*3+2],SRGBColorSpace);tiles.setColorAt(i,color);
  transform.position.toArray(centers,i*3);releases[i]=releaseTime(transform.position.toArray());first=Math.min(first,releases[i]);last=Math.max(last,releases[i]);ids[i]=i;seeds.set(streamSeeds(i),i*3);
 }
 geometry.setAttribute("aStreamSeed",new InstancedBufferAttribute(seeds,3));
 geometry.setAttribute("aFragmentCenter",new InstancedBufferAttribute(centers,3));geometry.setAttribute("aReleaseTime",new InstancedBufferAttribute(releases,1));geometry.setAttribute("aFragmentIndex",new InstancedBufferAttribute(ids,1));
 tiles.instanceMatrix.needsUpdate=true;tiles.instanceColor.needsUpdate=true;tiles.frustumCulled=false;tiles.name=`${kind}-consumption-tiles`;applyConsumptionMaterial(material,clock,{instanced:true});
 const core=new Mesh(new SphereGeometry(radius*(kind==="earth"?.98:.85),40,24),new MeshStandardMaterial({color:kind==="earth"?"#103f70":"#77767b",roughness:.95}));core.position.set(8.1,.7,.3);core.name="receding-foundation";
 root.add(core,tiles);root.name=`consumption-${kind}`;root.userData.excludeFromDiscAtlas=true;
 root.userData.consumption={clock,endTime:last+CONSUMPTION_DURATION,pieces:count,first,last,core};return root;
}
/** Only the backing moves on CPU; individual tiles keep their original instance buffers. */
export function updateConsumedPlanet(root,time){
 const data=root.userData.consumption;data.clock.value=time;
 const fraction=Math.max(0,Math.min(1,(time-data.first)/Math.max(.01,data.last-data.first)));
 data.core.scale.setScalar(Math.max(.0001,1-fraction));data.core.position.x=8.1-Math.min(time,data.last)*APPROACH_SPEED;data.core.visible=fraction<1;
}
export function disposeConsumedPlanet(root){root.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();mesh.material.dispose();if(mesh.isInstancedMesh)mesh.dispose();}});}
