import {AdditiveBlending,Color,DynamicDrawUsage,Group,IcosahedronGeometry,InstancedMesh,Mesh,MeshBasicMaterial,Object3D,RingGeometry,Vector3} from "three";
/** Small, preallocated blast: hot pressure front, fire lobes, then cooler rising smoke. */
export function createCrashBlast(){
 const root=new Group();root.name="Crash blast";root.scale.setScalar(.45);
 const geometry=new IcosahedronGeometry(1,1),ringGeometry=new RingGeometry(.92,1,32);
 const fireMaterial=new MeshBasicMaterial({color:"#ffffff",transparent:true,depthWrite:false,toneMapped:false});
 const smokeMaterial=new MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:0,depthWrite:false,toneMapped:false});
 const waveMaterial=new MeshBasicMaterial({color:"#ffd795",transparent:true,blending:AdditiveBlending,depthWrite:false,toneMapped:false,side:2});
 const flashMaterial=new MeshBasicMaterial({color:"#fff1b0",transparent:true,blending:AdditiveBlending,depthWrite:false,toneMapped:false});
 const fire=new InstancedMesh(geometry,fireMaterial,14),smoke=new InstancedMesh(geometry,smokeMaterial,10),wave=new Mesh(ringGeometry,waveMaterial),flash=new Mesh(geometry,flashMaterial);
 const scratch=new Object3D(),color=new Color(),axis=new Vector3(0,0,1),directions=Array.from({length:14},(_,i)=>{const y=1-2*(i+.5)/14,r=Math.sqrt(1-y*y),angle=i*2.399963;return new Vector3(Math.cos(angle)*r,y,Math.sin(angle)*r);});
 for(const mesh of [fire,smoke]){mesh.instanceMatrix.setUsage(DynamicDrawUsage);mesh.frustumCulled=false;for(let i=0;i<mesh.count;i++){scratch.scale.setScalar(0);scratch.updateMatrix();mesh.setMatrixAt(i,scratch.matrix);color.set(mesh===fire?(i%3===0?"#fff0a1":i%3===1?"#ff9828":"#ff3c0a"):i%2?"#3b3532":"#69615a");mesh.setColorAt(i,color);}mesh.instanceMatrix.needsUpdate=true;}
 wave.scale.setScalar(0);flash.scale.setScalar(0);root.add(fire,smoke,wave,flash);
 let active=false;const up=new Vector3(0,1,0);
 function hide(){active=false;root.visible=false;}
 return {root,fire,smoke,wave,flash,hide,
  trigger(event,reducedMotion=false){
   hide();if(event.kind!=="crash"||reducedMotion)return;
   active=true;root.visible=true;root.position.copy(event.point);wave.quaternion.setFromUnitVectors(axis,event.normal);
   up.copy(event.normal);fireMaterial.opacity=1;smokeMaterial.opacity=0;waveMaterial.opacity=0;flashMaterial.opacity=0;
  },
  step(age){
   if(!active)return false;if(age>=1.65){hide();return false;}
   const t=Math.max(0,age),fireLife=Math.max(0,1-t/.8);
   fire.visible=t<.8;smoke.visible=t>.1;wave.visible=t<.38;flash.visible=t<.18;
   flash.scale.setScalar(.16+.95*(1-Math.exp(-t*35)));flashMaterial.opacity=Math.max(0,1-t/.18)*.85;
   wave.scale.setScalar(.15+7*t);waveMaterial.opacity=Math.max(0,1-t/.38)*.55;
   if(fire.visible){
    for(let i=0;i<fire.count;i++){const d=directions[i],travel=.1+1.35*(1-Math.exp(-t*9));scratch.position.copy(d).multiplyScalar(travel).addScaledVector(up,t*.4);scratch.rotation.set(i*.7+t*2,i*.9,t);scratch.scale.setScalar((.25+.95*(1-Math.exp(-t*24)))*fireLife*(.75+(i%4)*.12));scratch.updateMatrix();fire.setMatrixAt(i,scratch.matrix);}
    fire.instanceMatrix.needsUpdate=true;fireMaterial.opacity=fireLife*.85;
   }
   if(smoke.visible){
    for(let i=0;i<smoke.count;i++){scratch.position.copy(directions[i]).multiplyScalar(.25+t*.95).addScaledVector(up,.2+t*1.1);scratch.rotation.set(i*.7+t*.3,i*.9,t*.2);scratch.scale.setScalar((.3+t*.55)*(.8+(i%3)*.15));scratch.updateMatrix();smoke.setMatrixAt(i,scratch.matrix);}
    smoke.instanceMatrix.needsUpdate=true;smokeMaterial.opacity=Math.min(1,(t-.1)/.2)*Math.max(0,1-t/1.65)*.55;
   }
   return true;
  },
  dispose(){fire.dispose();smoke.dispose();geometry.dispose();ringGeometry.dispose();fireMaterial.dispose();smokeMaterial.dispose();waveMaterial.dispose();flashMaterial.dispose();root.removeFromParent();}
 };
}
