import test from "node:test";
import assert from "node:assert/strict";
import {createAccretionBands} from "../components/three/black-hole/black-hole-data.mjs";
import {createBlackHole,disposeBlackHole} from "../components/three/black-hole/create-black-hole.mjs";
import {discAtlasResolution,secondaryDiscRadius,discAtlasUv,warmLensingWeight} from "../components/three/black-hole/lensing.mjs";

test("wide-disc variant extends the disc without changing the original data",()=>{
 const original=createAccretionBands(),wide=createAccretionBands({wide:true});assert.equal(original.bands.length,5);assert.equal(wide.bands.length,7);
 assert.ok(wide.bands.at(-1).radius>original.bands.at(-1).radius*1.45);assert.ok(wide.loose.every(t=>t.radius>=5.7));
 assert.equal(wide.bands[0].speed,original.bands[0].speed);assert.ok(wide.bands.at(-1).speed<original.bands.at(-1).speed);
 const model=createBlackHole({wideDisc:true});assert.equal(model.userData.modelStats.panels,1442);assert.equal(model.userData.modelStats.draws,12);assert.ok(model.userData.modelStats.triangles<450000);disposeBlackHole(model);
});
test("top-down atlas keeps bounded square detail independent of viewing angle",()=>{
 for(const [w,h] of [[1920,1080],[3840,2160],[400,900],[1,1]]){const size=discAtlasResolution(w,h);assert.ok(size>=384&&size<=768);assert.equal(size,discAtlasResolution(h,w));}
});

test("secondary disc image compresses the visible source disc outside the opaque core",()=>{
 assert.equal(secondaryDiscRadius(2.08),2.22);assert.ok(Math.abs(secondaryDiscRadius(2.80)-5.4)<1e-8);
 let previous=0;for(let r=1.9;r<=2.8;r+=.01){const source=secondaryDiscRadius(r);assert.ok(source>=2.22&&source<=5.4);assert.ok(source>=previous);previous=source;}
});

test("disc atlas maps every secondary source inside the capture without edge clamping",()=>{
 for(let r=2.22;r<=5.4;r+=.1)for(let a=0;a<Math.PI*2;a+=.1){const uv=discAtlasUv(r,a);assert.ok(uv.every(x=>x>.08&&x<.92));assert.ok(Math.abs(Math.hypot(uv[0]-.5,uv[1]-.5)*13.2-r)<1e-8);}
 assert.deepEqual(discAtlasUv(0,0),[.5,.5]);
});

test("secondary image excludes blue and neutral graphite reflections while retaining amber light",()=>{
 assert.equal(warmLensingWeight([.12,.17,.24]),0);assert.equal(warmLensingWeight([.15,.15,.15]),0);assert.equal(warmLensingWeight([0,0,0]),0);
 assert.equal(warmLensingWeight([.8,.35,.04]),1);assert.ok(warmLensingWeight([.3,.22,.12])>.5);
});
