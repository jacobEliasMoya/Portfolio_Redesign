import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import {createHudLetterGeometry} from "../components/three/ufo/hud-letter-geometry.mjs";
const font=new FontLoader().parse(JSON.parse(readFileSync(new URL("../public/fonts/sabo-filled.typeface.json",import.meta.url))));
test("actual Sabo glyphs preserve counters and produce finite extruded HUD geometry",()=>{
 assert.equal(font.data.familyName,"Sabo Filled");
 assert.equal(font.generateShapes("B",1)[0].holes.length,2);assert.equal(font.generateShapes("O",1)[0].holes.length,1);
 for(const text of ["JAKE’S SPACE","GUIDE","L / LAUNCH","LAND","IN FLIGHT","HOME","CHARGE"]){
  for(const char of text)assert.ok(font.data.glyphs[char],`missing actual Sabo glyph: ${char}`);
  const geometry=createHudLetterGeometry(font,text);geometry.computeBoundingBox();
  assert.ok(geometry.attributes.position.array.every(Number.isFinite));assert.ok(geometry.boundingBox.max.z-geometry.boundingBox.min.z>=.159);assert.ok(Math.abs(geometry.boundingBox.max.y+geometry.boundingBox.min.y)<1e-6);
  assert.ok(geometry.groups.some(group=>group.materialIndex===1),"extruded sides use a separate material");geometry.dispose();
 }
});
// Per-character centering must not pull punctuation down to the cap middle.
test("independent characters share one cap baseline and preserve high punctuation",()=>{
 const bounds=char=>{const geometry=createHudLetterGeometry(font,char,{fixedBaseline:true});geometry.computeBoundingBox();const box=geometry.boundingBox.clone();geometry.dispose();return box;};
 const h=bounds("H"),i=bounds("I"),apostrophe=bounds("\u2019");
 assert.ok(Math.abs(h.min.y-i.min.y)<1e-5);assert.ok(Math.abs(h.max.y-i.max.y)<1e-5);
 assert.ok(apostrophe.min.y>0,"apostrophe stays above the middle of the capitals");
});
