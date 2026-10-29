import fs from "node:fs";
import {gzipSync} from "node:zlib";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {mergeVertices} from "three/addons/utils/BufferGeometryUtils.js";
import {createHexagonalEarthGeometry} from "../components/three/planet/hexagonal-earth-geometry.mjs";
const hex=createHexagonalEarthGeometry(),rawBox=new RoundedBoxGeometry(1,1,1,1,.1),box=mergeVertices(rawBox);
const rows=[];
for(const [file,geometry] of [["earth/block-earth.json",hex],["moon/block-moon.json",hex],["jakes-space-particle-core.json",box]]){
 const buffer=fs.readFileSync(new URL("../public/models/"+file,import.meta.url)),data=JSON.parse(buffer),instances=data.sizes?.length??data.scales.length;
 const triangles=(geometry.index?.count??geometry.attributes.position.count)/3;
 rows.push({file,instances,triangles:instances*triangles,bytes:buffer.length,estimatedGzipBytes:gzipSync(buffer).length});
}
console.table(rows);
console.log(`Rounded particle geometry: ${rawBox.attributes.position.count} → ${box.attributes.position.count} stored vertices, same ${box.index.count/3} triangles.`);
console.log("Static asset/geometry audit only. These are not measured FPS or network-transfer results; clouds, UFO and inner skins add geometry.");
hex.dispose();rawBox.dispose();box.dispose();
