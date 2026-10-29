import fs from "node:fs";
import {Color,Group,InstancedMesh,Mesh,MeshBasicMaterial,MeshPhysicalMaterial,MeshStandardMaterial,Object3D,Vector3} from "three";
import {createCrashPool} from "../components/three/ufo/crash-pool.mjs";
import {createHexSaucerTiles} from "../components/three/ufo/hexagonal-saucer-data.mjs";
import {createHexCanopy} from "../components/three/ufo/hexagonal-canopy-geometry.mjs";
import {createHexagonalEarthGeometry} from "../components/three/planet/hexagonal-earth-geometry.mjs";
import {createDestructible} from "../components/three/ufo/projectile-collision.mjs";
const ship=new Group(),tiles=createHexSaucerTiles(),source=new InstancedMesh(createHexagonalEarthGeometry(),new MeshStandardMaterial(),tiles.length),o=new Object3D();
tiles.forEach((t,i)=>{o.position.set(t.x,t.y,t.z);o.scale.set(t.width,t.depth,t.width);o.updateMatrix();source.setMatrixAt(i,o.matrix);source.setColorAt(i,new Color(.5,.5,.5));});ship.add(source);
const canopy=createHexCanopy();ship.add(new Mesh(canopy.glass,new MeshPhysicalMaterial()),new Mesh(canopy.frame,new MeshStandardMaterial()));
const pool=createCrashPool(ship),prepare=[];
while(!pool.ready){const t=performance.now();pool.prepare(3);prepare.push(+(performance.now()-t).toFixed(3));}
const event={kind:"crash",point:new Vector3(),normal:new Vector3(0,1,0),velocity:new Vector3()},triggers=[],steps=[];
for(let i=0;i<12;i++){let t=performance.now();pool.trigger(event);triggers.push(+(performance.now()-t).toFixed(3));t=performance.now();pool.step(.016,.016);steps.push(+(performance.now()-t).toFixed(3));pool.step(.1,2);}
console.log(JSON.stringify({scenario:"CPU-only hex hull + canopy subset; excludes other ship parts/GPU",fragments:pool.fragmentCount,debrisBatches:pool.batchCount,pooledSparkBatches:1,preparationTasksMs:prepare,crashTriggerMs:triggers,firstStepMs:steps}));pool.dispose();
const data=JSON.parse(fs.readFileSync(new URL("../public/models/earth/block-earth.json",import.meta.url),"utf8")),mesh=new InstancedMesh(createHexagonalEarthGeometry(),new MeshBasicMaterial(),data.sizes.length),normal=new Vector3(),up=new Vector3(0,1,0);
for(let i=0;i<data.sizes.length;i++){o.position.fromArray(data.positions,i*3);normal.fromArray(data.normals,i*3).normalize();o.quaternion.setFromUnitVectors(up,normal);o.scale.set(data.sizes[i]*1.4,data.sizes[i]*1.15,data.sizes[i]*1.4);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);}
const target=createDestructible(mesh,new Set(),{foundation:2.94,mode:"dent"}),chunks=[],queries=[];let ready=false;
while(!ready){const t=performance.now();ready=target.prepareIndex(384);chunks.push(performance.now()-t);}
for(let i=0;i<6;i++){const t=performance.now();target.query(new Vector3(0,0,4.5),new Vector3(0,0,2.4),i);queries.push(+(performance.now()-t).toFixed(3));}
console.log(JSON.stringify({scenario:"CPU-only actual Earth index, prepared before proximity",tiles:data.sizes.length,chunks:chunks.length,totalPreparationMs:+chunks.reduce((a,b)=>a+b,0).toFixed(3),longestChunkMs:+Math.max(...chunks).toFixed(3),queryMs:queries}));
