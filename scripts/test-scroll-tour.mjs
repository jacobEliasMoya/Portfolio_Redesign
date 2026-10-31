import test from "node:test";
import assert from "node:assert/strict";
import {createScrollTour,createTourAnchors,stepTourStops,wheelTourProgress,clampTour,TOUR_STOPS} from "../components/three/animation/scroll-tour.mjs";
test("tour stops frame opening overview, Jake, Space, California and Moon in order and follow moving landmarks",()=>{
 const tour=createScrollTour(),anchors=createTourAnchors();
 for(const [progress,point] of TOUR_STOPS.map(stop=>[stop.progress,anchors[stop.key]])){const view=tour.sample(progress,anchors);assert.ok(view.target.distanceTo(point)<1e-9);assert.ok(view.position.distanceTo(point)>=22,"landmark views retain the wide tour distance");}
 const space=tour.sample(.5,anchors).position.clone();anchors.space.x+=2;assert.ok(tour.sample(.5,anchors).target.equals(anchors.space));assert.ok(tour.sample(.5,anchors).position.distanceTo(space)>1);
 const first=tour.sample(1,anchors).position.clone();anchors.moon.x+=5;anchors.moon.z+=3;
 assert.ok(tour.sample(1,anchors).position.distanceTo(first)>3);assert.ok(tour.sample(1,anchors).target.equals(anchors.moon));
 assert.equal(stepTourStops(0,1),.25);assert.equal(stepTourStops(.75,1),1);assert.equal(stepTourStops(1,-1),.75);assert.equal(stepTourStops(.2,-1),0);
});

test("scroll path is reversible, continuous and clear of Earth and Moon",()=>{
 const tour=createScrollTour(),anchors=createTourAnchors();assert.equal(clampTour(-1),0);assert.equal(clampTour(2),1);
 for(let i=0;i<=2000;i++){
  const p=tour.sample(i/2000,anchors),before=p.position.clone(),target=p.target.clone();
  assert.ok(p.position.distanceTo(anchors.earthCenter)>=anchors.earthRadius*1.3-1e-8);assert.ok(p.position.distanceTo(anchors.moon)>=anchors.moonRadius*1.5-1e-8);
  assert.ok(p.position.distanceTo(p.target)>2);if(i<2000)assert.ok(before.distanceTo(tour.sample((i+1)/2000,anchors).position)<.4);
  const back=tour.sample(i/2000,anchors);assert.ok(back.position.distanceTo(before)<1e-9);assert.ok(back.target.distanceTo(target)<1e-9);
 }
});
test("wheel directions retrace the tour and normalize line/page deltas",()=>{
 const next=wheelTourProgress(.4,100);assert.ok(next>.4);assert.ok(Math.abs(wheelTourProgress(next,-100)-.4)<1e-10);
 assert.equal(wheelTourProgress(0,2,1),wheelTourProgress(0,32));assert.equal(wheelTourProgress(1,100),1);assert.equal(wheelTourProgress(0,-100),0);
});

test("opening view follows behind the Moon looking inward at Earth, then scroll visits Jake",()=>{
 const tour=createScrollTour(),anchors=createTourAnchors();
 let previous=tour.sample(0,anchors).position.clone();
 for(let i=0;i<10;i++){
  anchors.moon.x+=1;anchors.moon.z+=2;
  const opening=tour.sample(0,anchors),outward=anchors.moon.clone().sub(anchors.earthCenter),behind=opening.position.clone().sub(anchors.moon);
  assert.ok(behind.dot(outward)>0,"camera must be outside the Moon's orbit looking inward");
  assert.ok(behind.length()>=Math.max(9,anchors.moonRadius*5)*.8);assert.ok(opening.target.equals(anchors.earthCenter));
  assert.ok(opening.position.distanceTo(previous)>.1);previous.copy(opening.position);
 }
 assert.ok(tour.sample(.01,anchors).position.distanceTo(previous)>0);
 assert.ok(tour.sample(.25,anchors).target.equals(anchors.jake));assert.equal(stepTourStops(.25,-1),0);
});
