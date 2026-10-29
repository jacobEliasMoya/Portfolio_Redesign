import test from "node:test";
import assert from "node:assert/strict";
import {Raycaster,Vector3} from "three";
import {createArchiveSatellite,disposeArchiveSatellite} from "../components/three/satellite/create-archive-satellite.mjs";

test("archive screen is visible through a real recess with one shared display texture",()=>{
 const model=createArchiveSatellite();model.updateMatrixWorld(true);
 const hits=new Raycaster(new Vector3(0,0,3),new Vector3(0,0,-1)).intersectObject(model);
 assert.equal(hits[0].object.name,"archive-display");
 assert.ok(hits[0].point.z>.46&&hits[0].point.z<.47);
 const display=model.getObjectByName("archive-display"),texture=display.material.map;
 assert.equal(texture,display.material.emissiveMap);assert.equal(texture.image.width,256);
 assert.equal(texture.image.data.length,256*256*4);
 assert.ok(model.userData.modelStats.draws<=8);assert.ok(model.userData.modelStats.triangles<10000);
 disposeArchiveSatellite(model);
});
test("asset owns finite geometry and releases its shared screen texture once",()=>{
 const model=createArchiveSatellite(),stats=model.userData.modelStats;
 assert.ok(stats.bounds[0]>5.8&&stats.bounds[0]<6.1);assert.ok(stats.bounds[2]>1.3&&stats.bounds[2]<2);
 let releases=0;model.getObjectByName("archive-display").material.map.addEventListener("dispose",()=>releases++);
 model.traverse(node=>{if(!node.isMesh)return;for(const attr of Object.values(node.geometry.attributes))for(const v of attr.array)assert.ok(Number.isFinite(v));});
 disposeArchiveSatellite(model);assert.equal(releases,1);
});
