import { test } from "node:test";
import assert from "node:assert/strict";
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { createSaucerGeometry, SAUCER_RADIUS } from "../components/three/ufo/saucer-geometry.mjs";
test("saucer has a broad closed hull with a raised central cockpit",()=>{
  const g=createSaucerGeometry();g.hull.computeBoundingBox();g.canopy.computeBoundingBox();
  const box=g.hull.boundingBox,dome=g.canopy.boundingBox;
  assert.ok(Math.abs(box.max.x-SAUCER_RADIUS)<.001);
  assert.ok((box.max.x-box.min.x)/(box.max.y-box.min.y)>4);
  assert.ok(dome.min.y>.4&&dome.max.y>1);
  assert.ok(dome.max.x<SAUCER_RADIUS*.4);
  const surface=new Mesh(g.hull,new MeshBasicMaterial());surface.updateMatrixWorld();const ray=new Raycaster();
  for(const start of [[0,3,0],[0,-3,0],[3,0,0],[0,0,3],[-3,0,0]]){
    const p=new Vector3(...start);ray.set(p,p.clone().normalize().negate());
    assert.ok(ray.intersectObject(surface).length>0,"solid hull must close top, bottom and rim");
  }
  Object.values(g).forEach((geometry)=>geometry?.dispose());surface.material.dispose();
});

test("refined rim and underside form distinct closed trim with a recessed engine well",()=>{
  const g=createSaucerGeometry();
  g.belt.computeBoundingBox();g.engine.computeBoundingBox();
  assert.ok(g.belt.boundingBox.max.y<.06&&g.belt.boundingBox.min.y>-.06);
  assert.ok(g.engine.boundingBox.min.y<-.53&&g.engine.boundingBox.max.y<-.35);
  const surface=new Mesh(g.engine,new MeshBasicMaterial());surface.updateMatrixWorld();
  const ray=new Raycaster(new Vector3(.43,-3,0),new Vector3(0,1,0));
  assert.ok(ray.intersectObject(surface).length>0,"engine housing must be solid around its opening");
  ray.set(new Vector3(0,-3,0),new Vector3(0,1,0));
  assert.equal(ray.intersectObject(surface).length,0,"central aperture should be inset within a real open well");
  Object.values(g).forEach((geometry)=>geometry?.dispose());surface.material.dispose();
});
