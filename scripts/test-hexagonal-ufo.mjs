import test from "node:test";
import assert from "node:assert/strict";
import {createHexSaucerTiles} from "../components/three/ufo/hexagonal-saucer-data.mjs";
test("hexagonal hull is deterministic, bounded to the existing collision hull and covers both faces",()=>{
 const tiles=createHexSaucerTiles();assert.deepEqual(tiles,createHexSaucerTiles());
 assert.ok(tiles.length>150&&tiles.length<500);
 for(const t of tiles){assert.ok(Number.isFinite(t.x+t.y+t.z+t.depth));assert.ok(Math.hypot(t.x,t.z)+t.width*.58<2.3);assert.ok(t.depth>=.075&&t.depth<.16);assert.ok(t.side===1?t.y>0:t.y<0);}
 assert.ok(tiles.some(t=>t.side===1));assert.ok(tiles.some(t=>t.side===-1));
 assert.ok(new Set(tiles.map(t=>t.depth.toFixed(3))).size>10);
});

test("reference revision uses coarser underside armor, sloped plates and real hexagonal canopy facets",async()=>{
 const {createHexCanopy}=await import("../components/three/ufo/hexagonal-canopy-geometry.mjs");
 const tiles=createHexSaucerTiles(),top=tiles.filter(t=>t.side===1),bottom=tiles.filter(t=>t.side===-1);
 assert.ok(bottom[0].width>top[0].width*1.3);
 assert.ok(top.some(t=>Math.hypot(t.normal[0],t.normal[2])>.2));
 const canopy=createHexCanopy();assert.ok(canopy.faces.filter(n=>n===6).length>5);
 for(const geometry of [canopy.glass,canopy.frame]){
  geometry.computeBoundingBox();assert.ok(geometry.boundingBox.min.y>=.45);assert.ok(geometry.boundingBox.max.y<=1.08);
  assert.ok(Array.from(geometry.getAttribute("position").array).every(Number.isFinite));geometry.dispose();
 }
});
