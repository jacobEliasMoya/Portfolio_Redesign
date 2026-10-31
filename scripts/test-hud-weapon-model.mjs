import test from "node:test";
import assert from "node:assert/strict";
import {Box3,Vector3} from "three";
import {createHudWeaponModel,layoutHudWeaponModel,stepHudWeaponModel} from "../components/three/ufo/hud-weapon-model.mjs";
import {createBlasterEnvelope,createBlasterMaterial} from "../components/three/ufo/plasma-visual.mjs";
import {createDeathRayModel} from "../components/three/ufo/death-ray-model.mjs";

test("HUD icons reuse actual bolt/ray volumes and shaders without altering gameplay assets",()=>{
 const bolt=createHudWeaponModel("bolts"),ray=createHudWeaponModel("death-ray"),source=createBlasterEnvelope(),shader=createBlasterMaterial(),gameRay=createDeathRayModel();
 const shell=bolt.art.children[0];assert.deepEqual(shell.geometry.attributes.position.array,source.attributes.position.array);
 assert.equal(shell.material.fragmentShader,shader.fragmentShader);assert.equal(shell.material.vertexShader.includes("instanceMatrix"),false);assert.equal(shader.vertexShader.includes("instanceMatrix"),true);
 assert.equal(shell.geometry.attributes.shotPower.count,shell.geometry.attributes.position.count);
 assert.equal(ray.rayModel.core.geometry.type,gameRay.core.geometry.type);assert.equal(ray.rayModel.shellMaterial.fragmentShader,gameRay.shellMaterial.fragmentShader);
 assert.equal(ray.rayModel.flare.parent,null,"slot icon has no contact ball");assert.equal(gameRay.flare.parent,gameRay.root,"in-world contact flare is preserved");
 assert.notEqual(ray.rayModel.core.geometry,gameRay.core.geometry);assert.ok(ray.rayModel.coreMaterial.color.r>ray.rayModel.coreMaterial.color.b*3);
 assert.throws(()=>createHudWeaponModel("reserved"));bolt.dispose();ray.dispose();source.dispose();shader.dispose();gameRay.dispose();
});

test("real icon volumes fit slot bounds on resize, reuse buffers and dispose every owned resource",()=>{
 for(const weapon of ["bolts","death-ray"]){
  const model=createHudWeaponModel(weapon),geometries=new Set(),materials=new Set();
  model.root.traverse(object=>{if(object.isMesh){geometries.add(object.geometry);materials.add(object.material);}});
  if(model.rayModel){geometries.add(model.rayModel.flare.geometry);materials.add(model.rayModel.flare.material);}
  const arrays=[...geometries].map(geometry=>geometry.attributes.position.array);
  for(const [width,height] of [[64,32],[52,32],[80,44]]){
   const rect={x:600,y:700,width,height},viewport={left:20,top:30,width:1440,height:900};
   layoutHudWeaponModel(model,rect,viewport);model.root.updateMatrixWorld(true);
   const box=new Box3().setFromObject(model.root),size=box.getSize(new Vector3()),center=box.getCenter(new Vector3());
   assert.ok(size.x<=width*.84+1e-6&&size.y<=height*.82+1e-6);
   assert.ok(Math.abs(center.x-(rect.x-viewport.left+width/2-viewport.width/2))<1e-6);
   assert.ok(Math.abs(center.y-(viewport.height/2-(rect.y-viewport.top+height/2)))<1e-6);
  }
  stepHudWeaponModel(model,3);if(model.rayModel)assert.equal(model.rayModel.shellMaterial.uniforms.uAge.value,3);
  stepHudWeaponModel(model,4,true);if(model.rayModel)assert.equal(model.rayModel.shellMaterial.uniforms.uAge.value,0);
  [...geometries].forEach((geometry,index)=>assert.equal(geometry.attributes.position.array,arrays[index]));
  let disposed=0;for(const resource of [...geometries,...materials])resource.addEventListener("dispose",()=>disposed++);
  model.dispose();assert.equal(disposed,geometries.size+materials.size);
 }
});
