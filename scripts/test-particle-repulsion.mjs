import test from "node:test";
import assert from "node:assert/strict";
import {particleRepulsion} from "../components/three/animation/particle-repulsion.mjs";
test("passing ship repels nearby particles outward with bounded smooth falloff",()=>{
 const ship={x:0,y:0,z:0};assert.deepEqual(particleRepulsion([3,0,0],ship),[0,0,0]);
 const near=particleRepulsion([.5,0,0],ship),far=particleRepulsion([1.5,0,0],ship);assert.ok(near[0]>far[0]&&far[0]>0);
 assert.ok(particleRepulsion([-.5,0,0],ship)[0]<0);assert.ok(particleRepulsion([0,0,0],ship).every(Number.isFinite));
});
