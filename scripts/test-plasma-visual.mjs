import test from "node:test";
import assert from "node:assert/strict";
import {createPlasmaEnvelope,createPlasmaMaterial} from "../components/three/ufo/plasma-visual.mjs";
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
