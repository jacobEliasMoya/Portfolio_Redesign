import test from "node:test";
import assert from "node:assert/strict";
import {getFlightInput,PRECISION_AIM_SCALE} from "../components/three/ufo/flight-controls.mjs";
import {createFlight,stepFlight} from "../components/three/ufo/saucer-flight.mjs";
import {Quaternion} from "three";
const input=(...keys)=>getFlightInput(new Set(keys));
test("WASD turns and thrusts; Q/E roll without strafe; Space/C change altitude",()=>{
 assert.equal(input("KeyW").thrust,1);assert.equal(input("KeyS").thrust,-1);
 assert.equal(input("KeyA").turn,-1);assert.equal(input("KeyD").turn,1);assert.equal(input("KeyA").strafe,0);
 assert.equal(input("KeyQ").roll,1);assert.equal(input("KeyE").roll,-1);assert.equal(input("KeyQ").strafe,0);assert.equal(input("KeyE").strafe,0);assert.equal(input("KeyQ","KeyE").roll,0);
 assert.equal(input("Space").lift,1);assert.equal(input("KeyC").lift,-1);assert.equal(input("ControlLeft").lift,0);
});

test("Shift gives quarter-speed arrow aiming, preserves braking/WASD/roll and keeps aliases from stacking",()=>{
 for(const shift of ["ShiftLeft","ShiftRight"]){
  assert.equal(input(shift,"ArrowRight").turn,PRECISION_AIM_SCALE);assert.equal(input(shift,"ArrowLeft").turn,-PRECISION_AIM_SCALE);
  assert.equal(input(shift,"ArrowUp").pitch,PRECISION_AIM_SCALE);assert.equal(input(shift,"ArrowDown").pitch,-PRECISION_AIM_SCALE);
  assert.equal(input(shift,"KeyD").turn,1);assert.equal(input(shift,"KeyD","ArrowRight").turn,1);
  assert.equal(input(shift,"KeyA","ArrowRight").turn,0);assert.equal(input(shift,"KeyQ").roll,1);assert.equal(input(shift,"KeyW").thrust,1);assert.equal(input(shift).brake,true);
 }
 for(const key of ["ArrowRight","ArrowUp"]){
  const normal=createFlight(),precision=createFlight();
  for(let i=0;i<60;i++){stepFlight(normal,input(key),1/60);stepFlight(precision,input("ShiftLeft",key),1/60);}
  const origin=new Quaternion();assert.ok(Math.abs(precision.orientation.angleTo(origin)/normal.orientation.angleTo(origin)-PRECISION_AIM_SCALE)<1e-8);
 }
});
test("arrow aliases do not double steering and opposite inputs cancel",()=>{
 assert.equal(input("KeyD","ArrowRight").turn,1);assert.equal(input("KeyA","ArrowLeft").turn,-1);
 assert.equal(input("KeyA","KeyD").turn,0);assert.equal(input("ArrowUp").pitch,1);assert.equal(input("ArrowDown").pitch,-1);
 assert.equal(input("ShiftLeft").brake,true);
 assert.deepEqual(getFlightInput(new Set(["KeyW","Space"]),false),{turn:0,pitch:0,thrust:0,strafe:0,roll:0,lift:0,brake:true});
});
