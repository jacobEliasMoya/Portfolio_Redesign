import test from "node:test";
import assert from "node:assert/strict";
import {Raycaster,Vector3,Mesh,MeshBasicMaterial,DoubleSide} from "three";
import {createUFOV3,disposeUFOV3} from "../components/three/ufo/create-ufo-v3.mjs";
import {createV3PanelLayout,polygonRadius,createV3PanelGeometry,createHexLoft} from "../components/three/ufo/ufo-v3-geometry.mjs";

test("V3 armor is deterministic, clipped to a six-sided rim and clear of its hexagonal openings",()=>{
 for(const side of [1,-1]){
  const panels=createV3PanelLayout(side);assert.deepEqual(panels,createV3PanelLayout(side));assert.ok(panels.length>30&&panels.length<160);
  const holes=side>0?[[.86,[0,0]]]:[[.67,[0,0]],...Array.from({length:3},(_,i)=>[.305,[Math.sin(i*Math.PI*2/3)*1.22,Math.cos(i*Math.PI*2/3)*1.22]])];
  for(const panel of panels)for(const [x,z] of panel.points){assert.ok(polygonRadius(x,z)<=1);for(const [radius,[cx,cz]] of holes){const d=Math.max(...Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return (x-cx)*Math.cos(a)+(z-cz)*Math.sin(a);}));assert.ok(d>=radius*Math.sqrt(3)/2-1e-7);}}
 }
});
test("closed hexagonal foundation presents outward top and bottom surfaces",()=>{
 const geometry=createHexLoft([[0,.4],[2.23,.1],[2.23,-.1],[0,-.4]]),mesh=new Mesh(geometry,new MeshBasicMaterial());mesh.updateMatrixWorld(true);
 for(const side of [1,-1]){const hit=new Raycaster(new Vector3(.2,side*3,.1),new Vector3(0,-side,0)).intersectObject(mesh);assert.ok(hit.length);assert.ok(hit[0].face.normal.y*side>0);}
 mesh.material.dispose();geometry.dispose();
});
test("V3 is finite, bounded, batched and keeps its rotating hull independent of the cockpit",()=>{
 const model=createUFOV3();model.updateMatrixWorld(true);const stats=model.userData.modelStats;
 assert.ok(stats.draws<=18);assert.ok(stats.triangles<18000);assert.ok(stats.bounds[0]<=4.6);
 const disc=model.getObjectByName("v3-disc"),cockpit=model.getObjectByName("v3-cockpit"),gear=model.getObjectByName("v3-gear");assert.equal(gear.visible,false);
 disc.rotation.y=.8;assert.equal(cockpit.rotation.y,0);
 model.traverse(n=>{if(n.isMesh)for(const a of Object.values(n.geometry.attributes))for(const v of a.array)assert.ok(Number.isFinite(v));});
 const panel=createV3PanelLayout(1).find(p=>p.points.length===6),geo=createV3PanelGeometry(panel),mesh=new Mesh(geo,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld(true);
 const [x,z]=panel.points.reduce((sum,p)=>[sum[0]+p[0]/6,sum[1]+p[1]/6],[0,0]);assert.ok(new Raycaster(new Vector3(x,3,z),new Vector3(0,-1,0)).intersectObject(mesh).length);
 geo.dispose();mesh.material.dispose();disposeUFOV3(model);
});
