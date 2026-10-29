import test from "node:test";
import assert from "node:assert/strict";
import {createScrollTour,wheelTourProgress,clampTour} from "../components/three/animation/scroll-tour.mjs";
test("scroll path is reversible, bounded and stays outside Earth",()=>{
 const tour=createScrollTour();assert.deepEqual(tour.sample(0).position.toArray(),[0,0,22]);assert.equal(clampTour(-1),0);assert.equal(clampTour(2),1);
 for(let i=0;i<=1000;i++){const p=tour.sample(i/1000);assert.ok(p.position.distanceTo(p.target)>12);if(i<1000)assert.ok(p.position.distanceTo(tour.sample((i+1)/1000).position)<.3);}
 assert.deepEqual(tour.sample(.5),tour.sample(.5));
});
test("wheel directions retrace the tour and normalize line/page deltas",()=>{
 const next=wheelTourProgress(.4,100);assert.ok(next>.4);assert.ok(Math.abs(wheelTourProgress(next,-100)-.4)<1e-10);
 assert.equal(wheelTourProgress(0,2,1),wheelTourProgress(0,32));assert.equal(wheelTourProgress(1,100),1);assert.equal(wheelTourProgress(0,-100),0);
});
