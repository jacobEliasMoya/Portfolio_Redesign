import test from "node:test";
import assert from "node:assert/strict";
import {renderDpr} from "../components/three/canvas/render-budget.mjs";
test("large and retina screens stay within two million render pixels",()=>{
 for(const [w,h] of [[1280,720],[1920,1080],[2560,1440],[3840,2160]])for(const device of [1,2,3]){
  const dpr=renderDpr(w,h,device);assert.ok(w*h*dpr*dpr<=2_000_001);assert.ok(dpr<=device);assert.ok(dpr<=1.25);
  const fallback=renderDpr(w,h,device,0);assert.ok(fallback<dpr);assert.ok(Math.abs(fallback/dpr-.65)<1e-10);
 }
});
