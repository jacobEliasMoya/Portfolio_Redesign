import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial,Vector3} from 'three';
import {createShipTides,stepShipTides,discEnvelope} from '../components/three/black-hole/ship-tides.mjs';
import {captureUniverse,releaseUniverse} from '../components/three/black-hole/live-consumption.mjs';
import {createBlackHole,disposeBlackHole} from '../components/three/black-hole/create-black-hole.mjs';
test('disc tides increase inward, recover on escape, remain finite at center and respect reduced motion',()=>{
 const t=createShipTides(),center=new Vector3(3,2,1),ship=center.clone().add(new Vector3(8,0,0));
 stepShipTides(t,ship,center,8,2);assert.equal(t.stretch.value,1);
 ship.x-=3;stepShipTides(t,ship,center,8,2);const middle=t.stretch.value;assert.ok(middle>1&&middle<7);assert.deepEqual(t.axis.value.toArray(),[-1,0,0]);
 stepShipTides(t,center,center,8,2);assert.equal(t.stretch.value,7);assert.ok(t.axis.value.toArray().every(Number.isFinite));
 stepShipTides(t,center,center,8,2,true);assert.equal(t.stretch.value,2.5);
 stepShipTides(t,new Vector3(30,0,0),center,8,2);assert.equal(t.stretch.value,1);
 const scaled=createShipTides();stepShipTides(t,ship,center,8,2);stepShipTides(scaled,ship.clone().multiplyScalar(2),center.clone().multiplyScalar(2),16,4);assert.equal(t.stretch.value,scaled.stretch.value);
});
test('actual wide disc defines reach without changing instance buffers',()=>{
 const model=createBlackHole({wideDisc:true});try{const bands=[];model.traverse(m=>{if(m.isInstancedMesh)bands.push([m,m.instanceMatrix.version,m.instanceMatrix.array]);});const radius=discEnvelope(model);assert.ok(radius>6.35&&radius<6.7);for(const [m,v,a] of bands){assert.equal(m.instanceMatrix.version,v);assert.equal(m.instanceMatrix.array,a);}}finally{disposeBlackHole(model);}
});
test('all hull pieces share world-centered tides with corrected normals and restore original materials',()=>{
 const scene=new Group(),ship=new Group();ship.userData.singularityShip=true;scene.add(ship);const geometry=new BoxGeometry(),material=new MeshStandardMaterial();const meshes=[new Mesh(geometry,material),new Mesh(geometry,material)];ship.add(...meshes);const capture=captureUniverse(scene,new Vector3());
 try{const shaders=meshes.map(m=>{const s={uniforms:{},vertexShader:'#include <defaultnormal_vertex>\n#include <project_vertex>'};m.material.onBeforeCompile(s,{});return s;});assert.equal(shaders[0].uniforms.uShipCenter,shaders[1].uniforms.uShipCenter);assert.match(shaders[0].vertexShader,/tidalNormalAlong\/uTidalStretch/);assert.match(shaders[0].vertexShader,/collapsePosition.xyz=uShipCenter/);assert.equal(capture.shipCaptureAge,null);}finally{releaseUniverse(capture);for(const m of meshes)assert.equal(m.material,material);geometry.dispose();material.dispose();}
});
