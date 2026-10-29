import test from "node:test";
import assert from "node:assert/strict";
import {createWeaponCharge} from "../components/three/ufo/weapon-charge.mjs";
import {createBoltPool,launchBolt} from "../components/three/ufo/projectile-pool.mjs";
import {Vector3,Quaternion} from "three";
test("tap, partial hold and full charge fire exactly once on release",()=>{
 const c=createWeaponCharge();assert.equal(c.release("key",0),null);
 c.begin("key",0);assert.equal(c.release("key",0),0);assert.equal(c.release("key",0),null);
 c.begin("pointer",100);assert.equal(c.level(850),.5);assert.equal(c.release("pointer",850),.5);
 c.begin("key",0);assert.equal(c.release("key",9000),1);
});
test("overlapping inputs share a charge; cancellation never fires",()=>{
 const c=createWeaponCharge();c.begin("key",0);c.begin("pointer",500);
 assert.equal(c.release("key",750),null);assert.equal(c.release("pointer",1500),1);
 c.begin("key",0);c.cancel();assert.equal(c.active,false);assert.equal(c.release("key",1000),null);
});
test("charged bolts are faster, bounded, and reuse existing pool",()=>{
 const p=createBoltPool(2),v=new Vector3(),q=new Quaternion();
 launchBolt(p,v,q,v,0);launchBolt(p,v,q,v,10);
 assert.equal(p[0].velocity.z,14);assert.equal(p[1].velocity.z,24);assert.equal(p[1].power,1);
});

test("plasma requires full charge and pulses gently without reduced-motion animation",async()=>{
 const {isFullCharge,plasmaPulse,chargedDamage}=await import("../components/three/ufo/weapon-charge.mjs");
 assert.equal(isFullCharge(.999),false);assert.equal(isFullCharge(1),true);
 assert.equal(chargedDamage(0),1);assert.equal(chargedDamage(.999),7);assert.equal(chargedDamage(1),20);
 for(let age=0;age<2;age+=.01){assert.ok(plasmaPulse(age)>=.88&&plasmaPulse(age)<=1.12);assert.equal(plasmaPulse(age,true),1);}
});
test("heat reserves yellow for a thin outer rim and deepens the center",async()=>{
 const {impactPalette}=await import("../components/three/planet/impact-material.mjs");
 const center=impactPalette(0,1),inner=impactPalette(.5,1),rim=impactPalette(1,1);
 assert.ok(center.r<inner.r);assert.ok(inner.g<.2);assert.ok(rim.g>.85);assert.ok(impactPalette(.8,1).g<.4);
});
