import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {Raycaster,Vector3} from 'three';
import {createArcadeInput} from '../components/three/arcade/arcade-input.mjs';
import {arcadeLayout,joystickKeys} from '../components/three/arcade/arcade-layout.mjs';
import {createArcadeCabinet,stepArcadeCabinet} from '../components/three/arcade/create-arcade-cabinet.mjs';
const font=new FontLoader().parse(JSON.parse(readFileSync(new URL('../public/fonts/sabo-filled.typeface.json',import.meta.url),'utf8')));
test('responsive cabinet has a truly open, rectangular live display at desktop and portrait sizes',()=>{
 for(const [w,h] of [[1248,644],[366,768],[820,400]]){
  const layout=arcadeLayout(w,h),s=layout.screen,model=createArcadeCabinet(layout,font);
  try{assert.ok(s.width>0&&s.height>0);assert.ok(s.x>0&&s.y>0&&s.x+s.width<w&&s.y+s.height<h);model.root.updateMatrixWorld(true);
   // Raycast points across the actual screen opening: no backing cap or sloped glass may cover it.
   for(const x of [.03,.5,.97])for(const y of [.03,.5,.97]){const ray=new Raycaster(new Vector3(s.x+s.width*x-w/2,h/2-s.y-s.height*y,200),new Vector3(0,0,-1));assert.equal(ray.intersectObject(model.root,true).length,0);}
   for(const sign of [-1,1]){const ray=new Raycaster(new Vector3(sign*(w/2-10),h/2-10,200),new Vector3(0,0,-1));const hits=ray.intersectObject(model.root,true);assert.ok(hits.length>0&&hits[0].distance<220,'mirrored rails must retain their front-facing surfaces');}
   let draws=0,triangles=0;model.root.traverse(m=>{if(m.isMesh){draws++;const g=m.geometry;triangles+=(g.index?g.index.count:g.attributes.position.count)/3;for(const v of g.attributes.position.array)assert.ok(Number.isFinite(v));}});assert.ok(draws<=15);assert.ok(triangles<18000);console.log(w,h,draws,triangles);
  }finally{model.dispose();}
 }
});
test('joystick center, diagonals, return-to-center and reduced-motion snap',()=>{
 assert.deepEqual(joystickKeys(0,0),[]);assert.deepEqual(joystickKeys(-20,-20),['KeyA','KeyW']);assert.deepEqual(joystickKeys(20,20),['KeyD','KeyS']);
 const model=createArcadeCabinet(arcadeLayout(1120,772),font);try{
  const buffers=model.caps.map(m=>m.geometry.attributes.position.array);stepArcadeCabinet(model,new Set(['KeyW','KeyA','KeyF','Digit1']),.1,true);assert.equal(model.lever.rotation.x,-.28);assert.equal(model.caps[0].position.z,18);
  assert.equal(stepArcadeCabinet(model,new Set(),.016),true);for(let i=0;i<80;i++)stepArcadeCabinet(model,new Set(),.016);assert.ok(Math.abs(model.lever.rotation.x)<1e-8);assert.ok(Math.abs(model.caps[0].position.z-22)<1e-8);assert.equal(model.caps[0].geometry.attributes.position.array,buffers[0]);
 }finally{model.dispose();}
});
test('all owned model resources are released once',()=>{
 const model=createArcadeCabinet(arcadeLayout(1120,772),font),geometry=new Set(),materials=new Set();model.root.traverse(m=>{if(m.isMesh){geometry.add(m.geometry);materials.add(m.material);}});let g=0,m=0;geometry.forEach(x=>x.addEventListener('dispose',()=>g++));materials.forEach(x=>x.addEventListener('dispose',()=>m++));model.dispose();assert.equal(g,geometry.size);assert.equal(m,materials.size);
});

function inputFixture(){const events=[],queue=new Map();let serial=0;const input=createArcadeInput((key,down)=>events.push([key,down]),callback=>{queue.set(++serial,callback);return serial;},id=>queue.delete(id));return {input,events,queue,flush(){const pending=[...queue.values()];queue.clear();pending.forEach(callback=>callback());}};}
test('touch steering and held fire work simultaneously and release independently',()=>{
 const f=inputFixture();f.input.steer(['KeyW','KeyD']);f.input.queueFire();f.flush();assert.deepEqual(f.events,[['KeyW',true],['KeyD',true],['KeyF',true]]);
 f.input.steer(['KeyA']);assert.deepEqual(f.events.slice(3),[['KeyW',false],['KeyD',false],['KeyA',true]]);
 f.input.releaseFire();assert.deepEqual(f.events.at(-1),['KeyF',false]);f.input.releaseStick();assert.deepEqual(f.events.at(-1),['KeyA',false]);
});
test('quick release and interrupted queued fire never start a stuck weapon',()=>{
 for(const action of ['releaseFire','clear']){const f=inputFixture();f.input.queueFire();f.input[action]();f.flush();assert.deepEqual(f.events,[]);assert.equal(f.queue.size,0);}
 const f=inputFixture();f.input.queueFire();f.input.queueFire();f.flush();assert.deepEqual(f.events,[['KeyF',true]]);f.input.clear();f.input.clear();assert.deepEqual(f.events,[['KeyF',true],['KeyF',false]]);
});
test('blur, modal, unmount and captured-state cleanup can release every owned input together',()=>{
 const f=inputFixture();f.input.steer(['KeyS','KeyA']);f.input.queueFire();f.flush();f.input.clear();assert.deepEqual(f.events.slice(3),[['KeyS',false],['KeyA',false],['KeyF',false]]);
});
