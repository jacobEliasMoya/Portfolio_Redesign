import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {InstancedMesh,MeshStandardMaterial,Object3D,Vector3,Quaternion,Color,InstancedBufferAttribute} from "three";
import {createLunarFacetGeometry,applyLunarFacets} from "../components/three/moon/lunar-facet-geometry.mjs";
import {createDestructible} from "../components/three/ufo/projectile-collision.mjs";
const data=JSON.parse(readFileSync(new URL("../public/models/moon/block-moon.json",import.meta.url)));
test("geodesic cells cover the sphere with twelve pentagons and outward fitted caps",()=>{
 assert.equal(data.facetCornerCounts.filter(n=>n===5).length,12);
 assert.ok(data.facetCornerCounts.every(n=>n===5||n===6));
 assert.equal(data.facetCorners.length,data.sizes.length*18);
 const center=new Vector3(),a=new Vector3(),b=new Vector3(),cross=new Vector3();
 for(let i=0;i<data.sizes.length;i++){
  center.fromArray(data.positions,i*3);
  for(let side=0;side<data.facetCornerCounts[i];side++){
   a.fromArray(data.facetCorners,i*18+side*3).sub(center);b.fromArray(data.facetCorners,i*18+((side+1)%data.facetCornerCounts[i])*3).sub(center);
   cross.crossVectors(b,a);assert.ok(cross.dot(center)>0,"cell fan must face outward");
  }
 }
});
test("major crater floors remain recessed and the landing pole stays supported",()=>{
 for(const crater of data.craters.slice(0,3)){
  const direction=new Vector3(...crater.direction);let nearest=Infinity,floor=0;
  for(let i=0;i<data.sizes.length;i++){
   const point=new Vector3().fromArray(data.positions,i*3),angle=Math.acos(Math.min(1,direction.dot(point.clone().normalize())));
   if(angle<nearest){nearest=angle;floor=point.length();}
  }
  assert.ok(floor<data.radius-crater.depth*.7);assert.ok(floor>data.foundation+.03);
 }
 for(let i=0;i<data.sizes.length;i++){
  const point=new Vector3().fromArray(data.positions,i*3);
  if(point.clone().normalize().y>.94)assert.ok(Math.abs(point.length()-data.radius)<.02);
 }
});
test("instance deformation reconstructs source corners and retains the vertex attribute budget",()=>{
 const geometry=createLunarFacetGeometry(data),point=new Vector3(),center=new Vector3(),rotation=new Quaternion(),up=new Vector3(0,1,0),normal=new Vector3();
 geometry.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(data.sizes.length),1));
 for(let i=0;i<data.sizes.length;i+=17){
  center.fromArray(data.positions,i*3);normal.fromArray(data.normals,i*3).normalize();rotation.setFromUnitVectors(up,normal);
  for(let corner=0;corner<6;corner++){
   point.fromBufferAttribute(geometry.getAttribute(`lunarPoint${corner}`),i).multiply(new Vector3(data.sizes[i]*data.tileTangentScale,data.sizes[i]*data.tileDepthScale,data.sizes[i]*data.tileTangentScale)).applyQuaternion(rotation).add(center);
   assert.ok(point.distanceTo(new Vector3().fromArray(data.facetCorners,i*18+corner*3))<1e-6);
  }
 }
 // Geometry attributes + instanceMatrix (four slots) + instanceColor fit WebGL2's minimum16.
 assert.ok(Object.keys(geometry.attributes).length+4+1<=16);
 const shader={vertexShader:"#include <common>\n#include <begin_vertex>",fragmentShader:"#include <common>\n#include <emissivemap_fragment>"};applyLunarFacets(shader);
 assert.ok(shader.vertexShader.includes("vImpactHeat = impactHeat"));assert.ok(shader.vertexShader.includes("vec3 transformed = lunarPosition"));assert.ok(shader.fragmentShader.includes("totalEmissiveRadiance"));
 geometry.dispose();
});
test("fitted facets still receive swept hits and eject pooled tile debris",()=>{
 const geometry=createLunarFacetGeometry(data);geometry.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(data.sizes.length),1));
 const material=new MeshStandardMaterial(),mesh=new InstancedMesh(geometry,material,data.sizes.length),transform=new Object3D(),normal=new Vector3(),up=new Vector3(0,1,0);
 for(let i=0;i<data.sizes.length;i++){
  transform.position.fromArray(data.positions,i*3);normal.fromArray(data.normals,i*3).normalize();transform.quaternion.setFromUnitVectors(up,normal);transform.scale.set(data.sizes[i]*data.tileTangentScale,data.sizes[i]*data.tileDepthScale,data.sizes[i]*data.tileTangentScale);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);mesh.setColorAt(i,new Color(.7,.7,.7));
 }
 mesh.updateMatrixWorld(true);const dead=new Set(),target=createDestructible(mesh,dead,{foundation:data.foundation,mode:"explode",threshold:12,padding:.012,blast:.10});
 const hit=target.query(new Vector3(0,0,2),new Vector3(0,0,.6),0);assert.ok(hit);hit.destroy(0);assert.ok(dead.size>0);assert.ok(target.stepDebris(.1)>0);assert.equal(target.planetPhase(),"intact");
 mesh.dispose();geometry.dispose();material.dispose();
});
