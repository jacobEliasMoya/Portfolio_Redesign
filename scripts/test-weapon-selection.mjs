import test from "node:test";
import assert from "node:assert/strict";
import {Quaternion,Vector3} from "three";
import {WEAPON_SLOTS,weaponForKey,createWeaponSelection} from "../components/three/ufo/weapon-selection.mjs";
import {createWeaponCharge} from "../components/three/ufo/weapon-charge.mjs";
import {createBoltPool,launchBolt,BOLT_LIFETIME} from "../components/three/ufo/projectile-pool.mjs";

test("keyboard slots select independent weapons; slot3 stays reserved without changing the current weapon",()=>{
 const selection=createWeaponSelection(),charge=createWeaponCharge(),shots=[];
 assert.equal(selection.selected,"bolts");assert.equal(weaponForKey("Numpad2"),"death-ray");
 assert.equal(selection.select("Digit2",charge,shots),true);assert.equal(selection.selected,"death-ray");
 assert.equal(selection.select("Digit3",charge,shots),false);assert.equal(selection.select("Numpad3",charge,shots),false);assert.equal(selection.selected,"death-ray");
 assert.equal(selection.select("Numpad1",charge,shots),true);assert.equal(selection.selected,"bolts");assert.equal(WEAPON_SLOTS[2].id,null);
});

test("weapon1 keeps a fully charged bolt; weapon2 fires while held without activating charge",()=>{
 const selection=createWeaponSelection(),charge=createWeaponCharge(),shots=[];
 selection.begin("key",0,charge);const shot=selection.release("key",1500,charge);assert.deepEqual(shot,{weapon:"bolts",power:1});
 const pool=createBoltPool(),zero=new Vector3();launchBolt(pool,zero,new Quaternion(),zero,shot.power);assert.equal(pool[0].power,1);assert.ok(pool[0].age<BOLT_LIFETIME);
 selection.select("Digit2",charge,shots);selection.begin("pointer",2000,charge);
 assert.equal(selection.rayHeld,true);assert.equal(charge.active,false);assert.equal(charge.level(2001),0);
 assert.equal(selection.release("pointer",2001,charge),null);assert.equal(selection.rayHeld,false);
});

test("overlapping mouse/key holds keep the ray on until both release; switching and cancellation clear held inputs",()=>{
 const selection=createWeaponSelection(),charge=createWeaponCharge(),shots=[];
 selection.select("Digit2",charge,shots);selection.begin("key",0,charge);selection.begin("pointer",1,charge);
 selection.release("key",2,charge);assert.equal(selection.rayHeld,true);selection.release("pointer",3,charge);assert.equal(selection.rayHeld,false);
 selection.begin("key",4,charge);selection.cancel(charge);assert.equal(selection.rayHeld,false);
 selection.select("Digit1",charge,shots);selection.begin("pointer",5,charge);shots.push({weapon:"bolts",power:1});
 selection.select("Digit2",charge,shots);assert.equal(charge.active,false);assert.equal(shots.length,0);assert.equal(selection.release("pointer",1000,charge),null);
});
