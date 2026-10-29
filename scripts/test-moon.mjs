import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BufferGeometry, DoubleSide, Euler, Float32BufferAttribute, Mesh, MeshBasicMaterial, Quaternion, Raycaster, Vector3 } from "three";
import { getMoonOrbitPose, MOON_ORBIT } from "../components/three/moon/moon-orbit.mjs";
const moon=JSON.parse(readFileSync(new URL("../public/models/moon/block-moon.json",import.meta.url)));
test("lunar geometry preserves signed survey relief and covers the whole sphere",()=>{
  const count=moon.sizes.length;
  assert.ok(count>5000&&count<60000);
  assert.ok(Math.min(...moon.elevationsMetres)<-5000&&Math.max(...moon.elevationsMetres)>5000);
  const faces=new Set();
  for(let i=0;i<count;i++){
    const p=moon.positions.slice(i*3,i*3+3),n=moon.normals.slice(i*3,i*3+3);
    const radius=Math.hypot(...p),expected=moon.radius*(1+moon.elevationsMetres[i]/1737400*moon.reliefExaggeration);
    assert.ok(Math.abs(radius-expected)<.000002);
    assert.ok(radius>.70&&radius<.95);
    assert.ok(Math.abs(Math.hypot(...n)-1)<.000001);
    const axis=n.map(Math.abs).indexOf(Math.max(...n.map(Math.abs)));faces.add(`${axis}:${Math.sign(n[axis])}`);
  }
  assert.equal(faces.size,6);
});
test("tidal lock keeps local near-side +Z facing Earth throughout an inclined orbit",()=>{
  const plane=new Quaternion().setFromEuler(new Euler(MOON_ORBIT.inclination,0,MOON_ORBIT.node));
  for(let t=0;t<=MOON_ORBIT.period;t+=.5){
    const pose=getMoonOrbitPose(t,15);
    const position=new Vector3(...pose.position).applyQuaternion(plane);
    const facing=new Vector3(0,0,1).applyAxisAngle(new Vector3(0,1,0),pose.yaw).applyQuaternion(plane);
    assert.ok(facing.dot(position.clone().negate().normalize())>1-1e-12);
    assert.ok(Math.abs(position.length()-15)<1e-10);
  }
  const first=getMoonOrbitPose(0,15),last=getMoonOrbitPose(MOON_ORBIT.period,15);
  assert.ok(Math.abs(last.yaw-first.yaw-Math.PI*2)<1e-12);
  assert.ok(new Vector3(...first.position).distanceTo(new Vector3(...last.position))<1e-10);
});

test("survey skin is sealed around the globe with outward triangle winding",()=>{
  const skin=moon.skin;
  assert.equal(skin.positions.length,skin.colors.length);
  for(let i=0;i<skin.indices.length;i+=3){
    const [ia,ib,ic]=skin.indices.slice(i,i+3);
    const a=new Vector3().fromArray(skin.positions,ia*3),b=new Vector3().fromArray(skin.positions,ib*3),c=new Vector3().fromArray(skin.positions,ic*3);
    const normal=b.clone().sub(a).cross(c.clone().sub(a));
    if(normal.lengthSq()>1e-16)assert.ok(normal.dot(a)>0);
  }
  assert.ok(moon.sizes.length<20000,"use a readable moderate tile count");
  assert.ok(Math.min(...moon.sizes)>.029,"no tiny adaptive hexagons");
  assert.ok(Math.max(...moon.sizes)/Math.min(...moon.sizes)<1.6,"consistent tile size range");
  assert.ok(moon.colors.reduce((a,b)=>Math.max(a,b),-Infinity)-moon.colors.reduce((a,b)=>Math.min(a,b),Infinity)>.5,"preserve maria/highland contrast");
});

test("opaque lunar terrain blocks sightlines through the globe from every direction",()=>{
  const geometry=new BufferGeometry();
  geometry.setAttribute("position",new Float32BufferAttribute(moon.skin.positions,3));
  geometry.setIndex(moon.skin.indices);geometry.computeBoundingSphere();
  const material=new MeshBasicMaterial({side:DoubleSide}),surface=new Mesh(geometry,material);
  surface.updateMatrixWorld();
  const ray=new Raycaster();
  for(let i=0;i<300;i++){
    const y=1-2*(i+.5)/300,angle=i*2.399963229728653;
    const n=new Vector3(Math.sqrt(1-y*y)*Math.cos(angle),y,Math.sqrt(1-y*y)*Math.sin(angle));
    ray.set(n.clone().multiplyScalar(3),n.clone().negate());
    const hits=ray.intersectObject(surface);
    assert.ok(hits.length>0,"survey shell must seal the background");
    assert.ok(hits[0].distance<2.31,"front surface should occlude the far side");
  }
  geometry.dispose();material.dispose();
});
