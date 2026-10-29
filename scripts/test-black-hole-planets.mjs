import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {Color,ShaderLib,SRGBColorSpace} from "three";
import {createConsumedPlanet,updateConsumedPlanet,disposeConsumedPlanet} from "../components/three/black-hole/consume-planet.mjs";
import {CAPTURE_RADIUS,APPROACH_SPEED} from "../components/three/black-hole/consume-ufo.mjs";

for(const kind of ["earth","moon"])test(`${kind} consumes original survey tiles, keeps colors and resets without buffer uploads`,()=>{
 const data=JSON.parse(readFileSync(new URL(`../public/models/${kind}/block-${kind}.json`,import.meta.url))),sourceFirst=data.positions.slice(0,3),model=createConsumedPlanet(data,kind),state=model.userData.consumption,tiles=model.getObjectByName(`${kind}-consumption-tiles`),g=tiles.geometry;
 assert.equal(tiles.count,data.sizes.length);assert.equal(model.children.length,2);assert.equal(state.pieces,data.sizes.length);
 assert.ok(state.first>0);assert.ok(state.last-state.first>2);assert.ok(state.endTime<12);
 assert.equal(g.getAttribute("aStreamSeed").count,tiles.count);
 const centers=g.getAttribute("aFragmentCenter"),releases=g.getAttribute("aReleaseTime"),color=new Color();
 for(let i=0;i<tiles.count;i++){
  const x=centers.getX(i)-releases.getX(i)*APPROACH_SPEED,y=centers.getY(i),z=centers.getZ(i);
  assert.ok(Math.abs(Math.hypot(x,y,z)-CAPTURE_RADIUS)<1e-5);
  tiles.getColorAt(i,color);const expected=new Color().setRGB(data.colors[i*3],data.colors[i*3+1],data.colors[i*3+2],SRGBColorSpace);
  assert.ok(Math.abs(color.r-expected.r)<1e-6&&Math.abs(color.g-expected.g)<1e-6&&Math.abs(color.b-expected.b)<1e-6);
 }
 const shader={uniforms:{},vertexShader:ShaderLib.standard.vertexShader};tiles.material.onBeforeCompile(shader);
 assert.equal(shader.uniforms.uConsumeTime,state.clock);
 assert.ok(shader.vertexShader.includes("attribute vec3 aStreamSeed"));assert.ok(shader.vertexShader.includes("streamSpin*consumeInstance[0].xyz"));assert.ok(shader.vertexShader.includes("consumeAge>0.0?streamCenter:attachedCenter"));
 assert.ok(shader.vertexShader.includes("mvPosition = consumeInstance * mvPosition"));
 assert.ok(shader.vertexShader.includes("mat3( consumeInstance )"));
 assert.ok(shader.vertexShader.includes("worldPosition = consumeInstance * worldPosition"));
 assert.ok(!shader.vertexShader.includes("#include <project_vertex>"));
 const versions=[tiles.instanceMatrix.version,tiles.instanceColor.version,centers.version,releases.version];
 updateConsumedPlanet(model,(state.first+state.last)/2);assert.ok(state.core.scale.x>0&&state.core.scale.x<1);
 updateConsumedPlanet(model,state.endTime);assert.equal(state.core.visible,false);
 updateConsumedPlanet(model,0);assert.equal(state.core.visible,true);assert.equal(state.core.scale.x,1);assert.equal(state.core.position.x,8.1);assert.equal(state.clock.value,0);
 assert.deepEqual([tiles.instanceMatrix.version,tiles.instanceColor.version,centers.version,releases.version],versions);assert.deepEqual(data.positions.slice(0,3),sourceFirst);
 let disposed=0;tiles.addEventListener("dispose",()=>disposed++);disposeConsumedPlanet(model);assert.equal(disposed,1);
});
test("invalid survey data is rejected before allocating a planet",()=>{
 assert.throws(()=>createConsumedPlanet({sizes:[1],radius:3,positions:[NaN,0,0],normals:[1,0,0],colors:[1,1,1]},"earth"),/Invalid/);
 assert.throws(()=>createConsumedPlanet({},"mars"),/Unknown/);
});
