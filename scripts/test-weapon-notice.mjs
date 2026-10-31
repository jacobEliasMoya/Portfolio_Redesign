import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import {createWeaponNoticeModel,resetWeaponNoticeModel,updateWeaponNoticeModel,WEAPON_NOTICE_SECONDS,WEAPON_NOTICE_REDUCED_SECONDS} from "../components/three/ufo/weapon-notice-model.mjs";
const font=new FontLoader().parse(JSON.parse(readFileSync(new URL("../public/fonts/sabo-filled.typeface.json",import.meta.url))));

test("weapon notice is real instanced Sabo volume with open counters, no raster substitute",()=>{
 const model=createWeaponNoticeModel(font,"O"),shape=font.generateShapes("O",1)[0].extractPoints(2);
 assert.ok(model.tiles.isInstancedMesh);assert.equal(model.geometry.type,"BoxGeometry");assert.ok(model.material.isMeshStandardMaterial);assert.equal(model.material.map,null);
 assert.ok(model.particles.length>10);assert.ok(shape.holes.length>0);
 const hole=shape.holes[0],cx=(Math.min(...hole.map(p=>p.x))+Math.max(...hole.map(p=>p.x)))/2,cy=(Math.min(...hole.map(p=>p.y))+Math.max(...hole.map(p=>p.y)))/2;
 const minX=Math.min(...shape.shape.map(p=>p.x)),cap=font.generateShapes("H",1).flatMap(s=>s.getPoints().map(p=>p.y)),capCenter=(Math.min(...cap)+Math.max(...cap))/2;
 assert.ok(!model.particles.some(p=>Math.hypot(p.x+minX+model.width/2-cx,p.y+capCenter-cy)<.05),"the O counter stays open");
 model.dispose();
});
test("notice pops, holds, physically disperses, clears and reuses the same particle buffers",()=>{
 const model=createWeaponNoticeModel(font,"CHARGED BOLTS"),positions=model.geometry.attributes.position.array,matrices=model.tiles.instanceMatrix.array;
 assert.ok(model.particles.length<3000);
 resetWeaponNoticeModel(model);const version=model.tiles.instanceMatrix.version;
 updateWeaponNoticeModel(model,0);assert.ok(model.art.scale.x<1);assert.ok(model.art.position.y<0);
 updateWeaponNoticeModel(model,.3);assert.equal(model.art.scale.x,1);assert.equal(Math.abs(model.art.position.y),0);
 updateWeaponNoticeModel(model,.8);assert.equal(model.tiles.instanceMatrix.version,version,"holding text does not reupload instances");
 updateWeaponNoticeModel(model,1.5);const dispersed=matrices.slice();assert.notDeepEqual(dispersed,model.initialMatrices);assert.ok(matrices.every(Number.isFinite));
 updateWeaponNoticeModel(model,WEAPON_NOTICE_SECONDS);assert.equal(model.root.visible,false);
 const stopped=model.tiles.instanceMatrix.version;updateWeaponNoticeModel(model,100);assert.equal(model.tiles.instanceMatrix.version,stopped);
 resetWeaponNoticeModel(model);assert.deepEqual(matrices,model.initialMatrices);
 for(let frame=0;frame<90;frame++)updateWeaponNoticeModel(model,frame/60);
 updateWeaponNoticeModel(model,1.5);assert.deepEqual(matrices,dispersed,"absolute-time particle poses are independent of frame history");
 assert.equal(model.geometry.attributes.position.array,positions);assert.equal(model.tiles.instanceMatrix.array,matrices);
 let disposed=0;for(const resource of [model.geometry,model.material,model.tiles])resource.addEventListener("dispose",()=>disposed++);
 model.dispose();assert.equal(disposed,3);
});
test("reduced motion holds a static announcement then clears without scattering",()=>{
 const model=createWeaponNoticeModel(font,"RED DEATH RAY",{color:"#ff6b54"});resetWeaponNoticeModel(model);
 updateWeaponNoticeModel(model,0,true);assert.equal(model.art.scale.x,1);assert.equal(model.art.position.y,0);
 updateWeaponNoticeModel(model,1.4,true);assert.ok(model.root.visible);assert.deepEqual(model.tiles.instanceMatrix.array,model.initialMatrices);
 updateWeaponNoticeModel(model,WEAPON_NOTICE_REDUCED_SECONDS,true);assert.equal(model.root.visible,false);model.dispose();
});
