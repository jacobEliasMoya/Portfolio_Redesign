import test from "node:test";
import assert from "node:assert/strict";
import {Group,InstancedMesh,Matrix4,MeshBasicMaterial,PerspectiveCamera,Quaternion,Ray,SphereGeometry,Vector3} from "three";
import {createObjectDragController,createDragHitTest,orbitSlideDelta} from "../components/three/animation/object-drag.mjs";

class Surface{
 constructor(){this.listeners=new Map();this.captures=new Set();this.style={touchAction:"pan-y"};this.ownerDocument={defaultView:this};}
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
 removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
 setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);}
 getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}
 emit(name,extra={}){for(const fn of this.listeners.get(name)??[])fn({pointerId:1,pointerType:"mouse",button:0,clientX:50,clientY:50,preventDefault(){},...extra});}
}
function camera(){const c=new PerspectiveCamera(40,1,.1,100);c.position.z=10;c.updateMatrixWorld();return c;}
test("the nearest object exclusively owns a gesture; blank space and disabled objects do nothing",()=>{
 const canvas=new Surface(),controller=createObjectDragController(canvas,camera(),()=>{});let far=0,near=0,enabled=true;
 controller.add({enabled:()=>true,hit:()=>5,move:()=>far++});const remove=controller.add({enabled:()=>enabled,hit:()=>2,move:()=>near++});
 canvas.emit("pointerdown");canvas.emit("pointermove",{clientX:60});assert.equal(near,1);assert.equal(far,0);
 enabled=false;canvas.emit("pointermove",{clientX:70});assert.equal(canvas.captures.size,0);canvas.emit("pointerup");
 remove();canvas.emit("pointerdown");canvas.emit("pointermove",{clientX:60});assert.equal(far,1);controller.dispose();assert.equal(canvas.style.touchAction,"pan-y");
 const blank=createObjectDragController(canvas,camera(),()=>{});canvas.emit("pointerdown");assert.equal(canvas.captures.size,0);blank.dispose();
});
test("touch gestures cancel for multiple fingers, blur and pointer loss",()=>{
 const canvas=new Surface(),controller=createObjectDragController(canvas,camera(),()=>{});let ended=0;
 controller.add({enabled:()=>true,hit:()=>2,move:()=>{},end:()=>ended++});
 canvas.emit("pointerdown",{pointerType:"touch"});canvas.emit("pointerdown",{pointerType:"touch",pointerId:2});assert.equal(ended,1);assert.equal(canvas.captures.size,0);
 canvas.emit("pointerup",{pointerId:1});canvas.emit("pointerup",{pointerId:2});canvas.emit("pointerdown");canvas.emit("blur");assert.equal(ended,2);
 canvas.emit("pointerdown");canvas.emit("lostpointercapture");assert.equal(ended,3);controller.dispose();
});
test("proxy hits respect world transforms, hidden ancestors and removed text instances",()=>{
 const parent=new Group(),mesh=new InstancedMesh(new SphereGeometry(1,6,4),new MeshBasicMaterial(),2);parent.add(mesh);parent.position.z=2;
 mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,2));mesh.setMatrixAt(1,new Matrix4().makeScale(0,0,0));parent.updateMatrixWorld(true);
 const hit=createDragHitTest({current:mesh},1,true),ray=new Ray(new Vector3(0,0,10),new Vector3(0,0,-1));assert.ok(Math.abs(hit(ray)-5)<1e-8);
 parent.visible=false;assert.equal(hit(ray),Infinity);parent.visible=true;mesh.setMatrixAt(0,new Matrix4().makeScale(0,0,0));assert.equal(hit(ray),Infinity);
 mesh.geometry.dispose();mesh.material.dispose();
});
test("letter sliding follows the existing Y orbit from front, back and rotated camera views",()=>{
 const q=new Quaternion();assert.ok(orbitSlideDelta(20,0,0,q)>0);assert.ok(orbitSlideDelta(20,0,Math.PI,q)<0);assert.equal(orbitSlideDelta(0,0,1,q),0);
 q.setFromAxisAngle(new Vector3(0,1,0),Math.PI);assert.ok(orbitSlideDelta(20,0,Math.PI,q)>0);
 assert.ok(Math.abs(orbitSlideDelta(10000,10000,1,q))<=.25);
});
