import test from "node:test";
import assert from "node:assert/strict";
import {glyphRepulsion,stepGlyphMotion} from "../components/three/ufo/hud-glyph-motion.mjs";

test("magnetic repulsion points away, stays bounded and ignores distant/inactive pointers",()=>{
 const pointer={x:10,y:10};
 for(let x=-80;x<=80;x+=5)for(let y=-80;y<=80;y+=5){
  const offset=glyphRepulsion(x,y,pointer,true);
  assert.ok(Number.isFinite(offset.x)&&Number.isFinite(offset.y));
  assert.ok(Math.hypot(offset.x,offset.y)<=4+1e-10);
  assert.ok(offset.x*(x-pointer.x)+offset.y*(y-pointer.y)>=0);
 }
 assert.deepEqual(glyphRepulsion(10,10,pointer,true),{x:0,y:-4});
 assert.deepEqual(glyphRepulsion(100,10,pointer,true),{x:0,y:0});
 assert.deepEqual(glyphRepulsion(12,10,pointer,false),{x:0,y:0});
});

test("hover spring is frame-rate independent and returns smoothly to rest",()=>{
 const run=rate=>{const state={x:0,y:0,vx:0,vy:0};for(let i=0;i<rate;i++)stepGlyphMotion(state,{x:4,y:-2},1/rate);return state;};
 const a=run(30),b=run(120);
 for(const key of ["x","y","vx","vy"])assert.ok(Math.abs(a[key]-b[key])<1e-9);
 assert.ok(a.x<=4&&a.y>=-2);
 let previous=Math.hypot(a.x,a.y);
 for(let i=0;i<120;i++){
  stepGlyphMotion(a,{x:0,y:0},1/60);const distance=Math.hypot(a.x,a.y);
  assert.ok(distance<=previous+1e-6);previous=distance;
 }
 assert.ok(previous<1e-8);
});
