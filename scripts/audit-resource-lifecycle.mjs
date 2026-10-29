import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
import {Group,InstancedMesh} from "three";
import {createUFOV3,disposeUFOV3} from "../components/three/ufo/create-ufo-v3.mjs";
import {createReferenceUFO,disposeReferenceUFO} from "../components/three/ufo/create-reference-ufo.mjs";
import {createAlienCannonModel,disposeAlienCannonModel} from "../components/three/ufo/alien-cannon.mjs";
import {createBlackHole,disposeBlackHole} from "../components/three/black-hole/create-black-hole.mjs";
import {createConsumedUFO,disposeConsumedUFO} from "../components/three/black-hole/consume-ufo.mjs";
import {createConsumedPlanet,disposeConsumedPlanet} from "../components/three/black-hole/consume-planet.mjs";
import {createArchiveSatellite,disposeArchiveSatellite} from "../components/three/satellite/create-archive-satellite.mjs";
import {createRimBurstResources} from "../components/three/ufo/rim-plasma.mjs";

const earth=JSON.parse(readFileSync(new URL("../public/models/earth/block-earth.json",import.meta.url))),moon=JSON.parse(readFileSync(new URL("../public/models/moon/block-moon.json",import.meta.url)));
const cases=[
 ["Angular UFO",createUFOV3,disposeUFOV3],
 ["Reference UFO",createReferenceUFO,disposeReferenceUFO],
 ["Shared cannon",createAlienCannonModel,disposeAlienCannonModel],
 ["Wide black hole",()=>createBlackHole({wideDisc:true}),disposeBlackHole],
 ["UFO consumption",createConsumedUFO,disposeConsumedUFO],
 ["Earth consumption",()=>createConsumedPlanet(earth,"earth"),disposeConsumedPlanet],
 ["Moon consumption",()=>createConsumedPlanet(moon,"moon"),disposeConsumedPlanet],
 ["Archive satellite",createArchiveSatellite,disposeArchiveSatellite],
 ["Rim plasma",()=>{const r=createRimBurstResources(),root=new Group(),outer=new InstancedMesh(r.geometry,r.shell,18),inner=new InstancedMesh(r.geometry,r.core,18);root.add(outer,inner);root.userData.cleanup=()=>r.dispose([outer,inner]);return root;},root=>root.userData.cleanup()]
];
function cycle(create,dispose){
 const root=create(),owned=new Set(),counts=new Map();
 root.traverse(mesh=>{if(!mesh.isMesh)return;if(mesh.isInstancedMesh)owned.add(mesh);owned.add(mesh.geometry);
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){owned.add(material);for(const value of Object.values(material))if(value?.isTexture)owned.add(value);}
 });
 for(const resource of owned)resource.addEventListener("dispose",()=>counts.set(resource,(counts.get(resource)??0)+1));
 dispose(root);
 for(const resource of owned)assert.equal(counts.get(resource),1,`owned ${resource.type??resource.constructor.name} must release exactly once`);
 return owned.size;
}
async function settleGc(){for(let i=0;i<3;i++){global.gc?.();await new Promise(resolve=>setImmediate(resolve));}}
for(const [,create,dispose] of cases)cycle(create,dispose);
await settleGc();const before=process.memoryUsage(),rows=[];
for(const [name,create,dispose] of cases){let releases=0;for(let i=0;i<10;i++)releases+=cycle(create,dispose);rows.push({name,cycles:10,releases,missingOrDuplicateReleases:0});}
await settleGc();const after=process.memoryUsage();
const report={scope:"CPU-only factory lifecycle audit; no WebGL renderer, browser navigation, React mounting or GPU/driver measurements",forcedGc:!!global.gc,rows,heapDeltaBytes:after.heapUsed-before.heapUsed,arrayBufferDeltaBytes:after.arrayBuffers-before.arrayBuffers};
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
