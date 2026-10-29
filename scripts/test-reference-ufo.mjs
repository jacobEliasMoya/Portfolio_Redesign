import test from "node:test";
import assert from "node:assert/strict";
import {Raycaster,Vector3} from "three";
import {createReferenceUFO,disposeReferenceUFO,referenceArmorTiles} from "../components/three/ufo/create-reference-ufo.mjs";
test("reference armor uses coarser lower plates, sloped surfaces and deterministic relief",()=>{
 const tiles=referenceArmorTiles();assert.deepEqual(tiles,referenceArmorTiles());
 const top=tiles.filter(t=>t.side>0),bottom=tiles.filter(t=>t.side<0);
 assert.ok(top.length>=60&&top.length<100);assert.ok(bottom.length>=30);
 assert.ok(Math.min(...bottom.map(t=>t.width))>Math.max(...top.map(t=>t.width)));
 assert.ok(top.some(t=>Math.abs(t.normal[0])>.1));assert.ok(new Set(top.map(t=>t.depth.toFixed(3))).size>10);
});
test("reference saucer is finite, batched and retains independent rotor, cockpit and gear",()=>{
 const root=createReferenceUFO();root.updateMatrixWorld(true);
 for(const name of ["reference-disc","reference-cockpit","reference-gear"])assert.ok(root.getObjectByName(name));
 assert.equal(root.getObjectByName("reference-gear").visible,false);
 root.traverse(n=>{if(n.isMesh)for(const a of Object.values(n.geometry.attributes))for(const v of a.array)assert.ok(Number.isFinite(v));});
 assert.ok(root.userData.modelStats.draws<=20);assert.ok(root.userData.modelStats.triangles<18000);
 const cockpit=root.getObjectByName("reference-cockpit"),q=cockpit.quaternion.clone();root.getObjectByName("reference-disc").rotation.y=1;assert.ok(cockpit.quaternion.equals(q));
 const hit=new Raycaster(new Vector3(0,0,-3),new Vector3(0,0,1)).intersectObject(root.getObjectByName("reference-disc"));assert.ok(hit.length>0);
 disposeReferenceUFO(root);
});
