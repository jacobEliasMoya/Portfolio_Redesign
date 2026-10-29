import test from "node:test";
import assert from "node:assert/strict";
import {getFlightInput} from "../components/three/ufo/flight-controls.mjs";
const input=(...keys)=>getFlightInput(new Set(keys));
test("WASD turns and thrusts; Q/E roll without strafe; Space/C change altitude",()=>{
 assert.equal(input("KeyW").thrust,1);assert.equal(input("KeyS").thrust,-1);
 assert.equal(input("KeyA").turn,-1);assert.equal(input("KeyD").turn,1);assert.equal(input("KeyA").strafe,0);
 assert.equal(input("KeyQ").roll,1);assert.equal(input("KeyE").roll,-1);assert.equal(input("KeyQ").strafe,0);assert.equal(input("KeyE").strafe,0);assert.equal(input("KeyQ","KeyE").roll,0);
 assert.equal(input("Space").lift,1);assert.equal(input("KeyC").lift,-1);assert.equal(input("ControlLeft").lift,0);
});
test("arrow aliases do not double steering and opposite inputs cancel",()=>{
 assert.equal(input("KeyD","ArrowRight").turn,1);assert.equal(input("KeyA","ArrowLeft").turn,-1);
 assert.equal(input("KeyA","KeyD").turn,0);assert.equal(input("ArrowUp").pitch,1);assert.equal(input("ArrowDown").pitch,-1);
 assert.equal(input("ShiftLeft").brake,true);
 assert.deepEqual(getFlightInput(new Set(["KeyW","Space"]),false),{turn:0,pitch:0,thrust:0,strafe:0,roll:0,lift:0,brake:true});
});
