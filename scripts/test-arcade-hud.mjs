import test from "node:test";
import assert from "node:assert/strict";
import {createHudState,stepActionText,actionForMode} from "../components/three/ufo/hud-state.mjs";
import {createWeaponSelection} from "../components/three/ufo/weapon-selection.mjs";
import {createWeaponCharge} from "../components/three/ufo/weapon-charge.mjs";
test("HUD store publishes discrete changes without frame notifications and isolates scene state",()=>{
 const store=createHudState(),other=createHudState();let calls=0;const off=store.subscribe(()=>calls++),initial=store.getSnapshot();
 for(let frame=0;frame<100;frame++)store.publish({mode:"docked",charge:0,canLand:false});
 assert.equal(calls,0);assert.ok(store.getSnapshot()===initial);
 store.publish({mode:"flying",charge:6});store.publish({tourIndex:3});
 assert.equal(calls,2);assert.equal(store.getSnapshot().charge,6);assert.equal(store.getSnapshot().tourIndex,3);assert.equal(other.getSnapshot().mode,"docked");
 store.publish({weapon:"death-ray"});store.publish({weapon:"death-ray"});assert.equal(calls,3);assert.equal(other.getSnapshot().weapon,"bolts");
 off();store.publish({charge:0});assert.equal(calls,3);
});
test("launch label erases every character, types LAND, and reverses after touchdown",()=>{
 let state={text:"LAUNCH",target:"LAUNCH",erasing:false};
 const frames=[];for(let i=0;i<11;i++){state=stepActionText(state,"LAND");frames.push(state.text);}
 assert.deepEqual(frames,["LAUNCH","LAUNC","LAUN","LAU","LA","L","","L","LA","LAN","LAND"]);
 const back=[];for(let i=0;i<11;i++){state=stepActionText(state,"LAUNCH");back.push(state.text);}
 assert.ok(back.includes(""));assert.equal(state.text,"LAUNCH");
});
test("label reversals mid-animation erase existing text before rebuilding the latest action",()=>{
 let state={text:"LAU",target:"LAND",erasing:true};state=stepActionText(state,"LAUNCH");
 const seen=[];for(let i=0;i<9;i++){state=stepActionText(state,"LAUNCH");seen.push(state.text);}
 assert.equal(seen[2],"");assert.equal(state.text,"LAUNCH");
 assert.equal(actionForMode("flying"),"LAND");assert.equal(actionForMode("launching"),"LAND");assert.equal(actionForMode("landed"),"LAUNCH");assert.equal(actionForMode("docked"),"LAUNCH");
});
test("slot requests use real weapon selection, cancel pending fire, reject reserved slots and detach cleanly",()=>{
 const store=createHudState(),other=createHudState(),weapons=createWeaponSelection(),charge=createWeaponCharge(),shots=[{weapon:"bolts",power:1}];let renders=0;
 store.subscribe(()=>renders++);assert.equal(store.requestWeapon("Digit2"),false);
 const detach=store.subscribeWeaponRequest(code=>weapons.select(code,charge,shots));
 charge.begin("key",0);assert.equal(store.requestWeapon("Digit2"),true);
 assert.equal(weapons.selected,"death-ray");assert.equal(charge.active,false);assert.equal(shots.length,0);assert.equal(renders,0);
 assert.equal(store.getSnapshot().weapon,"bolts","selection is published by the real ship, not guessed by the bar");
 weapons.begin("key",1,charge);assert.ok(weapons.rayHeld);
 assert.equal(store.requestWeapon("Digit3"),false);assert.ok(weapons.rayHeld);
 assert.equal(other.requestWeapon("Digit1"),false);assert.ok(weapons.rayHeld);
 store.requestWeapon("Digit1");assert.equal(weapons.selected,"bolts");assert.equal(weapons.rayHeld,false);
 detach();assert.equal(store.requestWeapon("Digit2"),false);assert.equal(weapons.selected,"bolts");
});
