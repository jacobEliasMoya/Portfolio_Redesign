import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import {createHudLetterResources} from "../components/three/ufo/hud-letter-model.mjs";
import {createScoreReels,updateScoreReels,stepScoreReel} from "../components/three/ufo/score-reels.mjs";
const font=new FontLoader().parse(JSON.parse(readFileSync(new URL("../public/fonts/sabo-filled.typeface.json",import.meta.url))));
test("mechanical reels roll forward through carries and settle after rapid score updates",()=>{
 const reel={value:9,destination:9,target:9,previous:9};
 stepScoreReel(reel,10,1/60);assert.ok(reel.value>9&&reel.value<10);
 stepScoreReel(reel,12,1/60);
 for(let i=0;i<200;i++)stepScoreReel(reel,12,1/60);
 assert.equal(reel.value,12);
 stepScoreReel(reel,123456,1/60);assert.ok(reel.destination-reel.value<20);
 for(let i=0;i<200;i++)stepScoreReel(reel,123456,1/60);
 assert.equal(reel.value%10,6);
 stepScoreReel(reel,123457,0,true);assert.equal(reel.value%10,7);
});
test("score uses shared real Sabo geometry, rotating drums and world-space reading windows",()=>{
 const resources=createHudLetterResources(font),model=createScoreReels(resources,5);
 try {
  model.root.position.y=100;model.root.scale.setScalar(28);
  assert.equal(model.reels.length,5);assert.equal(model.reels[0].meshes[0].geometry,resources.geometry("0"));
  updateScoreReels(model,999,0,true);
  assert.deepEqual(model.reels.map(reel=>reel.value%10),[0,0,9,9,9]);
  updateScoreReels(model,1000,1/60);
  assert.ok(model.reels[1].meshes.some(mesh=>mesh.visible&&Math.abs(mesh.rotation.x)>.001));
  updateScoreReels(model,1000,0,true);
  assert.deepEqual(model.reels.map(reel=>reel.value%10),[0,1,0,0,0]);
  assert.ok(model.planes[0].distanceToPoint({x:0,y:100,z:0})>0);
  assert.ok(model.planes[0].distanceToPoint({x:0,y:80,z:0})<0);
  let disposed=0;model.reels[0].meshes[0].material.forEach(material=>material.addEventListener("dispose",()=>disposed++));
  model.dispose();assert.equal(disposed,2);
 } finally {resources.dispose();}
});
