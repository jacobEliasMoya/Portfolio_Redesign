import test from "node:test";
import assert from "node:assert/strict";
import {createBlasterEnvelope,createBlasterMaterial,createPlasmaEnvelope,createPlasmaMaterial} from "../components/three/ufo/plasma-visual.mjs";

test("blaster silhouette is slim, closed at both ends and aligned with forward +Z",()=>{
 const geometry=createBlasterEnvelope();geometry.computeBoundingBox();const bounds=geometry.boundingBox;
 assert.ok(bounds.max.z>.8&&bounds.min.z<-1.1);
 assert.ok((bounds.max.z-bounds.min.z)/(bounds.max.x-bounds.min.x)>8);
 const position=geometry.getAttribute("position");let front=0,rear=0;
 for(let i=0;i<position.count;i++){
  assert.ok([position.getX(i),position.getY(i),position.getZ(i)].every(Number.isFinite));
  if(position.getZ(i)>.8)front=Math.max(front,Math.hypot(position.getX(i),position.getY(i)));
  if(position.getZ(i)<-1.19)rear=Math.max(rear,Math.hypot(position.getX(i),position.getY(i)));
 }
 assert.ok(front<.05&&rear<1e-6);geometry.dispose();
});

test("fired blaster shading is stable and charge shading remains independent",()=>{
 const bolt=createBlasterMaterial(),charge=createPlasmaMaterial({instanced:false});
 assert.equal(bolt.depthTest,true);assert.equal(bolt.depthWrite,false);assert.equal(bolt.transparent,true);
 assert.equal(bolt.vertexShader.includes("uTime"),false);assert.ok(bolt.vertexShader.includes("shotPower"));
 assert.ok(charge.fragmentShader.includes("filament"));assert.equal(charge.vertexShader.includes("shotPower"),false);
 bolt.dispose();charge.dispose();
});
test("plasma silhouette has a rounded teardrop head, pointed trailing wake and finite normals",()=>{
 const g=createPlasmaEnvelope();g.computeBoundingBox();
 assert.ok(g.boundingBox.min.z<-2.2);assert.ok(g.boundingBox.max.z>1.05);
 const p=g.getAttribute("position"),normal=g.getAttribute("normal");let tail=0,head=0;
 for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getY(i));if(p.getZ(i)<-1.6)tail=Math.max(tail,r);if(p.getZ(i)>.1)head=Math.max(head,r);}
 assert.ok(head>tail*5);assert.ok(Array.from(normal.array).every(Number.isFinite));g.dispose();
});
test("plasma shell remains transparent, depth tested and avoids depth writes",()=>{
 const m=createPlasmaMaterial();assert.equal(m.transparent,true);assert.equal(m.depthTest,true);assert.equal(m.depthWrite,false);assert.equal(m.uniforms.uTime.value,0);m.dispose();
});

test("charging sphere uses the shared filament shader without instanced-only transforms",()=>{
 const charge=createPlasmaMaterial({instanced:false}),bolt=createPlasmaMaterial();
 assert.equal(charge.fragmentShader,bolt.fragmentShader);assert.equal(charge.vertexShader.includes("instanceMatrix"),false);assert.equal(bolt.vertexShader.includes("instanceMatrix"),true);
 charge.dispose();bolt.dispose();
});
