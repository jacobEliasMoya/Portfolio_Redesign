import test from "node:test";
import assert from "node:assert/strict";
import {Mesh,MeshBasicMaterial,Raycaster,Vector3} from "three";
import {createHexHousingGeometry,createHexRingGeometry,createScreenGeometry,createDishGeometry} from "../components/three/satellite/satellite-geometry.mjs";
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function hit(geometry,origin,direction){const mesh=new Mesh(geometry,new MeshBasicMaterial());mesh.updateMatrixWorld();const hits=new Raycaster(new Vector3(...origin),new Vector3(...direction)).intersectObject(mesh);mesh.material.dispose();return hits;}
test("satellite geometry buffers are finite, indexed and bounded",()=>{
 for(const create of [createHexHousingGeometry,createHexRingGeometry,createScreenGeometry,createDishGeometry]){
  const g=create();assert.ok(g.index);for(const attr of Object.values(g.attributes))assert.ok([...attr.array].every(Number.isFinite));assert.ok(g.boundingSphere.radius>0);assert.ok(g.index.count%3===0);g.dispose();
 }
});
test("housing has true six-sided dimensions, tapered closed rear and correct outward caps",()=>{
 const g=createHexHousingGeometry(),box=g.boundingBox;close(box.max.x,1.35);close(box.max.y,1.35*Math.sqrt(3)/2);close(box.max.z,.38);close(box.min.z,-.9);
 close(hit(g,[0,0,2],[0,0,-1])[0].point.z,.38);close(hit(g,[0,0,-2],[0,0,1])[0].point.z,-.9);
 assert.equal(hit(g,[1.3,0,-2],[0,0,1])[0].point.z>-.9,true);g.dispose();
});
test("frame center stays open while the six-sided rim remains solid",()=>{
 const g=createHexRingGeometry();assert.equal(hit(g,[0,0,2],[0,0,-1]).length,0);assert.ok(hit(g,[1.18,0,2],[0,0,-1]).length>0);close(g.boundingBox.max.z,.1);close(g.boundingBox.min.z,-.1);g.dispose();
});
test("CRT face is convex with outward normals and continuous projected UVs",()=>{
 const g=createScreenGeometry(),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;close(p.getZ(0),.035);
 for(let i=0;i<p.count;i++){assert.ok(n.getZ(i)>.9);close(uv.getX(i),.5+p.getX(i)/(2*.99));close(uv.getY(i),.5+p.getY(i)/(2*.99));}
 const hitCenter=hit(g,[0,0,1],[0,0,-1]);assert.ok(hitCenter.length>0);close(hitCenter[0].point.z,.035);g.dispose();
});
test("dish has upward-facing concave interior and a closed back",()=>{
 const g=createDishGeometry();close(g.boundingBox.max.y,.25);close(g.boundingBox.min.y,-.04);
 const upper=hit(g,[.3,1,0],[0,-1,0]),lower=hit(g,[.3,-1,0],[0,1,0]);assert.ok(upper.length>0);assert.ok(lower.length>0);assert.ok(upper[0].point.y>lower[0].point.y);assert.ok(upper[0].face.normal.y>0);assert.ok(lower[0].face.normal.y<0);g.dispose();
});
