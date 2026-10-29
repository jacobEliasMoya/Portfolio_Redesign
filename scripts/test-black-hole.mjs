import test from "node:test";
import assert from "node:assert/strict";
import {Raycaster,Vector3} from "three";
import {createShellPanels,createAccretionBands,blackHoleOrbitSpeed} from "../components/three/black-hole/black-hole-data.mjs";
import {animateBlackHole,createBlackHole,disposeBlackHole} from "../components/three/black-hole/create-black-hole.mjs";

test("shell is a complete geodesic tiling with hex faces and twelve spherical junctions",()=>{
 const panels=createShellPanels();assert.equal(panels.length,1442);assert.equal(panels.filter(p=>p.points.length===5).length,12);assert.ok(panels.every(p=>p.points.length===5||p.points.length===6));
 for(const p of panels){assert.ok(Math.abs(new Vector3(...p.normal).length()-1)<1e-6);assert.ok(p.points.every(q=>q.every(Number.isFinite)));}
 const a=createAccretionBands();assert.deepEqual(a,createAccretionBands());assert.ok(a.bands.every(b=>b.tiles.length>500&&b.tiles.length<900));assert.ok(blackHoleOrbitSpeed(2.2)>blackHoleOrbitSpeed(3.6)*2);
});
test("matte shell is sealed, finite and keeps orbital animation off the instance buffers",()=>{
 const root=createBlackHole();root.updateMatrixWorld(true);const shell=root.getObjectByName("matte-hex-sphere"),orbit=root.getObjectByName("tilted-accretion-disc");
 for(const mesh of shell.children){assert.equal(mesh.material.roughness,1);assert.equal(mesh.material.metalness,0);assert.ok(mesh.material.color.r<.01);}
 for(const normal of [new Vector3(0,0,1),new Vector3(1,1,0).normalize(),new Vector3(-1,-.3,1).normalize()]){const hits=new Raycaster(normal.clone().multiplyScalar(5),normal.clone().negate()).intersectObject(shell);assert.ok(hits.length>0);assert.ok(hits[0].point.length()>=1.98);assert.ok(hits[0].face.normal.dot(normal)>0);}
 root.traverse(n=>{if(n.isMesh)for(const attr of Object.values(n.geometry.attributes))for(const v of attr.array)assert.ok(Number.isFinite(v));});
 const snapshots=orbit.children.map(m=>[m.instanceMatrix.version,m.instanceColor.version]);for(let i=0;i<60;i++)animateBlackHole(root,1/60);
 orbit.children.forEach((m,i)=>{assert.deepEqual([m.instanceMatrix.version,m.instanceColor.version],snapshots[i]);assert.ok(Math.abs(m.rotation.y-m.userData.orbitSpeed)<1e-8);});
 const before=orbit.children[0].rotation.y;animateBlackHole(root,.05,true);assert.equal(orbit.children[0].rotation.y,before);
 assert.equal(root.userData.modelStats.draws,10);assert.ok(root.userData.modelStats.triangles<250000);
 let disposed=0;orbit.children[0].geometry.addEventListener("dispose",()=>disposed++);disposeBlackHole(root);assert.equal(disposed,1);
});
