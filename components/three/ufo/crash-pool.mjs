import {AdditiveBlending,BufferGeometry,Color,DynamicDrawUsage,Float32BufferAttribute,Group,InstancedMesh,Matrix4,Mesh,MeshBasicMaterial,Object3D,Vector3} from "three";
function splitGeometry(source){
 source.computeBoundingSphere();
 if(source.boundingSphere.radius<=1)return [source.clone()];
 const flat=source.index?source.toNonIndexed():source.clone(),p=flat.getAttribute("position"),buckets=Array.from({length:8},()=>[]);
 for(let i=0;i<p.count;i+=3){const x=p.getX(i)+p.getX(i+1)+p.getX(i+2),z=p.getZ(i)+p.getZ(i+1)+p.getZ(i+2);const sector=Math.min(7,Math.floor((Math.atan2(z,x)+Math.PI)/(Math.PI*2)*8));buckets[sector].push(i,i+1,i+2);}
 const result=[];
 for(const ids of buckets){if(!ids.length)continue;const g=new BufferGeometry();for(const name of Object.keys(flat.attributes)){const a=flat.getAttribute(name),values=new Float32Array(ids.length*a.itemSize);ids.forEach((id,i)=>{for(let k=0;k<a.itemSize;k++)values[i*a.itemSize+k]=a.array[id*a.itemSize+k];});g.setAttribute(name,new Float32BufferAttribute(values,a.itemSize));}result.push(g);}
 flat.dispose();return result;
}
const particle=()=>({position:new Vector3(),velocity:new Vector3(),spin:new Vector3(),rotation:new Vector3(),scale:new Vector3()});
/** Prepare incrementally; triggering only snapshots transforms into already allocated batches. */
export function createCrashPool(ship){
 const root=new Group(),sources=[],batches=[],materials=new Map(),scratch=new Object3D(),matrix=new Matrix4(),local=new Matrix4(),color=new Color();
 ship.traverse(o=>{if(o instanceof Mesh&&!o.userData.noCrashDebris&&o.geometry.getAttribute("position"))sources.push(o);});
 let cursor=0,active=false,duration=2,skipMotion=false,sparkWarming=2;
 const sparksGeometry=new BufferGeometry();sparksGeometry.setAttribute("position",new Float32BufferAttribute([-.04,-.04,0,.04,-.04,0,0,.07,0],3));
 const sparksMaterial=new MeshBasicMaterial({color:"#ffffff",transparent:true,depthWrite:false,blending:AdditiveBlending,side:2});
 const sparks=new InstancedMesh(sparksGeometry,sparksMaterial,18),sparkState=Array.from({length:18},particle);sparks.instanceMatrix.setUsage(DynamicDrawUsage);sparks.frustumCulled=false;sparks.visible=true;root.add(sparks);
 scratch.scale.setScalar(0);scratch.updateMatrix();for(let i=0;i<18;i++)sparks.setMatrixAt(i,scratch.matrix);sparks.instanceMatrix.needsUpdate=true;
 for(let i=0;i<18;i++){color.set(i%2?"#ffb74b":"#ffe9a3");sparks.setColorAt(i,color);}
 function motion(piece,event,i){const angle=i*2.399;piece.velocity.copy(piece.position).sub(event.point).normalize().multiplyScalar(event.kind==="crash"?2:1).addScaledVector(event.normal,1.5);piece.velocity.x+=Math.cos(angle)*1.5;piece.velocity.y+=Math.sin(angle)*1.5;piece.velocity.z+=Math.sin(angle*1.7)*1.5;piece.velocity.addScaledVector(event.velocity,.2);piece.spin.set(Math.sin(angle)*3,Math.cos(angle)*4,2);}
 function hide(){active=false;for(const b of batches)b.mesh.visible=false;sparks.visible=false;}
 return {root,get ready(){return cursor===sources.length&&sparkWarming===0&&!batches.some(b=>b.warming);},get batchCount(){return batches.length;},get fragmentCount(){return batches.reduce((n,b)=>n+b.state.length,0);},
 prepare(budgetMs=3){
  if(!active&&sparkWarming>0&&--sparkWarming===0)sparks.visible=false;
  // Warm each new batch for one rendered frame at zero scale, then hide it.
  if(!active)for(const b of batches)if(b.warming){b.mesh.visible=false;b.warming=false;}
  const start=performance.now();
  while(cursor<sources.length&&performance.now()-start<budgetMs){
   const source=sources[cursor++],original=Array.isArray(source.material)?source.material[0]:source.material;
   if(!materials.has(original)){const m=original.clone();m.transparent=true;m.depthWrite=false;materials.set(original,{material:m,opacity:original.opacity});}
   const material=materials.get(original).material;
   const geometries=source instanceof InstancedMesh?[source.geometry.clone()]:splitGeometry(source.geometry);
   for(const geometry of geometries){
    geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new Vector3());geometry.translate(-center.x,-center.y,-center.z);
    const count=source instanceof InstancedMesh?source.count:1,mesh=new InstancedMesh(geometry,material,count),state=Array.from({length:count},particle);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);mesh.frustumCulled=false;scratch.scale.setScalar(0);scratch.updateMatrix();
    for(let i=0;i<count;i++){mesh.setMatrixAt(i,scratch.matrix);if(source instanceof InstancedMesh&&source.instanceColor){source.getColorAt(i,color);mesh.setColorAt(i,color);}}
    mesh.instanceMatrix.needsUpdate=true;root.add(mesh);batches.push({source,mesh,center,state,warming:true});
   }
  }
  return cursor===sources.length;
 },trigger(event,reducedMotion=false){
  hide();duration=event.kind==="crash"?2:.5;skipMotion=reducedMotion;active=true;
  if(event.kind==="crash"&&!reducedMotion){
   ship.updateWorldMatrix(true,true);let index=0;
   for(const b of batches){b.mesh.visible=true;b.warming=false;for(let i=0;i<b.state.length;i++){
    matrix.copy(b.source.matrixWorld);if(b.source instanceof InstancedMesh){b.source.getMatrixAt(i,local);matrix.multiply(local);}
    local.makeTranslation(b.center.x,b.center.y,b.center.z);matrix.multiply(local);matrix.decompose(scratch.position,scratch.quaternion,scratch.scale);
    const p=b.state[i];p.position.copy(scratch.position);p.scale.copy(scratch.scale);scratch.rotation.setFromQuaternion(scratch.quaternion);p.rotation.set(scratch.rotation.x,scratch.rotation.y,scratch.rotation.z);motion(p,event,index++);b.mesh.setMatrixAt(i,matrix);
   }b.mesh.instanceMatrix.needsUpdate=true;}
  }
  sparks.count=reducedMotion?3:event.kind==="crash"?18:8;sparks.visible=true;
  for(let i=0;i<sparks.count;i++){const p=sparkState[i];p.position.copy(event.point);p.scale.setScalar(1);p.rotation.set(0,0,0);motion(p,event,i);scratch.position.copy(p.position);scratch.rotation.set(0,0,0);scratch.scale.setScalar(1);scratch.updateMatrix();sparks.setMatrixAt(i,scratch.matrix);}sparks.instanceMatrix.needsUpdate=true;
 },step(delta,age){
  if(!active)return false;const fade=Math.max(0,1-age/duration),dt=Math.min(delta,.05);
  if(fade===0){hide();return false;}
  function animate(mesh,states,count){for(let i=0;i<count;i++){const p=states[i];if(!skipMotion){p.position.addScaledVector(p.velocity,dt);p.velocity.multiplyScalar(Math.exp(-dt));p.rotation.addScaledVector(p.spin,dt);}scratch.position.copy(p.position);scratch.rotation.set(p.rotation.x,p.rotation.y,p.rotation.z);scratch.scale.copy(p.scale);scratch.updateMatrix();mesh.setMatrixAt(i,scratch.matrix);}mesh.instanceMatrix.needsUpdate=true;}
  for(const b of batches)if(b.mesh.visible)animate(b.mesh,b.state,b.state.length);
  for(const {material,opacity} of materials.values())material.opacity=opacity*fade;
  animate(sparks,sparkState,sparks.count);sparksMaterial.opacity=fade;return true;
 },dispose(){for(const b of batches){b.mesh.dispose();b.mesh.geometry.dispose();}for(const {material} of materials.values())material.dispose();sparks.dispose();sparksGeometry.dispose();sparksMaterial.dispose();root.clear();root.removeFromParent();}};
}
