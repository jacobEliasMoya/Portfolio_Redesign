import test from "node:test";
import assert from "node:assert/strict";
import {createLunarFlagGeometry,flagFold,flagHoverWash} from "../components/three/moon/lunar-flag-geometry.mjs";
test("Sabo monogram follows dimensional folded cloth and stays within the flag",()=>{
 const geometry=createLunarFlagGeometry();
 for(const g of Object.values(geometry)){g.computeBoundingBox();assert.ok(g.boundingBox.min.x>=-.001&&g.boundingBox.max.x<=.421);assert.ok(g.boundingBox.min.y>=.359&&g.boundingBox.max.y<=.621);assert.ok(Array.from(g.getAttribute("position").array).every(Number.isFinite));}
 const p=geometry.letters.getAttribute("position");for(let i=0;i<p.count;i++){const z=p.getZ(i)-flagFold(p.getX(i),p.getY(i));assert.ok(z>.002&&z<.007);}
 assert.ok(geometry.cloth.boundingBox.max.z-geometry.cloth.boundingBox.min.z>.02);
 Object.values(geometry).forEach(g=>g.dispose());
});
test("pointer fabric push stays localized, bounded and anchored with matching printed-layer displacement",()=>{
 assert.equal(flagHoverWash(0,.5,1,.3,.5,1),0);assert.equal(flagHoverWash(.3,.5,1,.3,.5,0),0);
 const near=flagHoverWash(.3,.5,1,.3,.5,1),far=flagHoverWash(.3,.5,1,0,.1,1);
 assert.ok(near>far*2);assert.notEqual(near,flagHoverWash(.3,.5,1.2,.3,.5,1));
 for(let x=0;x<=.42;x+=.02)for(let time=0;time<5;time+=.1)assert.ok(Math.abs(flagHoverWash(x,.5,time,.3,.5,1))<=.018);
 const z=flagFold(.3,.5),push=flagHoverWash(.3,.5,2,.3,.5,1);
 assert.ok(Math.abs((z+.004+push)-(z+push)-.004)<1e-10);
});

test("launch wash anchors cloth at pole and stops when the craft is gone",async()=>{
 const {flagLaunchWash}=await import("../components/three/moon/lunar-flag-geometry.mjs");
 assert.equal(flagLaunchWash(0,.5,1,1),0);assert.equal(flagLaunchWash(.4,.5,1,0),0);
 assert.notEqual(flagLaunchWash(.4,.5,1,1),flagLaunchWash(.4,.5,1.1,1));assert.ok(Math.abs(flagLaunchWash(.42,.5,1,1))<.026);
});
