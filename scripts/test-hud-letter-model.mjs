import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Vector3} from "three";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import {createHudLetterResources,createHudLetterModel,stepHudLetterModel} from "../components/three/ufo/hud-letter-model.mjs";
const font=new FontLoader().parse(JSON.parse(readFileSync(new URL("../public/fonts/sabo-filled.typeface.json",import.meta.url))));

test("HUD assets are lit extruded meshes, share repeated glyph resources and release their GPU assets",()=>{
 const resources=createHudLetterResources(font),a=createHudLetterModel(resources,"A A",{fontSize:32}),b=createHudLetterModel(resources,"A");
 assert.equal(a.children.length,2);assert.equal(a.scale.x,32);
 const mesh=a.children[0];assert.ok(mesh.isMesh);assert.equal(mesh.isSprite,undefined);
 assert.equal(mesh.geometry,a.children[1].geometry);assert.equal(mesh.geometry,b.children[0].geometry);
 assert.equal(mesh.material,b.children[0].material);
 for(const material of mesh.material){assert.ok(material.isMeshStandardMaterial);assert.equal(material.map,null);}
 mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox;
 assert.ok(box.max.z-box.min.z>=.159);assert.ok(Math.abs(box.min.z+box.max.z)<1e-6);
 assert.ok(mesh.geometry.attributes.normal.array.every(Number.isFinite));
 let geometryDisposals=0,materialDisposals=0;
 mesh.geometry.addEventListener("dispose",()=>geometryDisposals++);
 mesh.material.forEach(material=>material.addEventListener("dispose",()=>materialDisposals++));
 resources.dispose();assert.equal(geometryDisposals,1);assert.equal(materialDisposals,2);
});

test("zero gravity and pointer interaction move the actual 3D pivots without changing layout or geometry",()=>{
 const resources=createHudLetterResources(font),model=createHudLetterModel(resources,"AB",{fontSize:32});
 model.position.set(100,200,0);const originalPosition=model.position.clone(),mesh=model.children[0],version=mesh.geometry.attributes.position.version;
 const origin={x:100,y:100},pointer={x:102,y:100,active:true};
 stepHudLetterModel(model,{elapsed:0,delta:1/60,pointer,origin});model.updateMatrixWorld(true);
 const normalA=new Vector3(0,0,1).transformDirection(mesh.matrixWorld),rotationA=mesh.rotation.clone();
 for(let i=1;i<=60;i++)stepHudLetterModel(model,{elapsed:i/60,delta:1/60,pointer,origin});model.updateMatrixWorld(true);
 const normalB=new Vector3(0,0,1).transformDirection(mesh.matrixWorld);
 assert.ok(normalA.distanceTo(normalB)>.001,"light-facing surface normal changes in real 3D");
 assert.notEqual(mesh.rotation.x,rotationA.x);assert.notEqual(mesh.rotation.y,model.children[1].rotation.y);
 assert.ok(Math.abs(mesh.position.z)>0,"letter moves along depth as well as X/Y");
 assert.ok(model.userData.glyphs[0].motion.x>0,"cursor to the left pushes the mesh right");
 assert.deepEqual(model.position,originalPosition);assert.equal(mesh.geometry.attributes.position.version,version);
 assert.ok(model.children.every(child=>child.matrixWorld.elements.every(Number.isFinite)));
 resources.dispose();
});

test("reduced motion gives a fixed mesh pose with no drift or magnetic displacement",()=>{
 const resources=createHudLetterResources(font),model=createHudLetterModel(resources,"JAKE");
 const options={delta:1/60,pointer:{x:0,y:0,active:true},origin:{x:0,y:0},reducedMotion:true};
 stepHudLetterModel(model,{...options,elapsed:0});model.updateMatrixWorld(true);
 const poses=model.children.map(mesh=>mesh.matrixWorld.toArray());
 stepHudLetterModel(model,{...options,elapsed:100});model.updateMatrixWorld(true);
 assert.deepEqual(model.children.map(mesh=>mesh.matrixWorld.toArray()),poses);
 resources.dispose();
});
