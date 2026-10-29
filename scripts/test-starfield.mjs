import test from "node:test";
import assert from "node:assert/strict";
import {buildStarfield} from "../components/three/space/starfield-data.mjs";
test("starfield is repeatable, bounded and leaves the flight region empty",()=>{
 const data=buildStarfield();assert.deepEqual(data,buildStarfield());assert.notDeepEqual(data,buildStarfield(83));
 assert.equal(data.points.length,1580);assert.equal(data.accents.length,28);
 for(const star of [...data.points,...data.accents]){
  const r=Math.hypot(star.position[0],star.position[1]-.35,star.position[2]+9);
  assert.ok(r>=55-1e-8&&r<=280+1e-8);assert.ok(star.size>0&&star.size<.3);assert.ok(star.color.every(c=>c>0&&c<=1));
 }
 const sectors=new Set(data.points.map(s=>`${Math.sign(s.position[0])},${Math.sign(s.position[1]-.35)},${Math.sign(s.position[2]+9)}`));assert.equal(sectors.size,8);
});
test("near and distant stars provide distinct geometric parallax",()=>{
 const {points}=buildStarfield();const near=points.slice(1400),far=points.slice(0,1400);
 const radius=s=>Math.hypot(s.position[0],s.position[1]-.35,s.position[2]+9);
 assert.ok(Math.max(...near.map(radius))<Math.min(...far.map(radius)));
});
