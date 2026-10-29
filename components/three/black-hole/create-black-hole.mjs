import {BufferGeometry,Color,Float32BufferAttribute,Group,InstancedMesh,Mesh,MeshStandardMaterial,Object3D,SphereGeometry,Vector3} from "three";
import {mergeVertices} from "three/addons/utils/BufferGeometryUtils.js";
import {createHexagonalEarthGeometry} from "../planet/hexagonal-earth-geometry.mjs";
import {createShellPanels,createAccretionBands} from "./black-hole-data.mjs";

function shellGeometry(panels){
 const positions=[],normals=[],uvs=[],ab=new Vector3(),ac=new Vector3(),normal=new Vector3();
 const tri=(a,b,c)=>{ab.subVectors(b,a);ac.subVectors(c,a);normal.crossVectors(ab,ac);if(normal.lengthSq()<1e-14)return;normal.normalize();for(const v of [a,b,c]){positions.push(...v.toArray());normals.push(...normal.toArray());uvs.push(0,0);}};
 const quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 for(const panel of panels){const n=new Vector3(...panel.normal),right=new Vector3(...panel.right),up=new Vector3(...panel.up),world=(p,radius,scale)=>n.clone().multiplyScalar(radius).addScaledVector(right,p[0]*scale).addScaledVector(up,p[1]*scale),r=2+panel.relief;
  const top=panel.points.map(p=>world(p,r,.965)),edge=panel.points.map(p=>world(p,r-.006,1.006)),bottom=panel.points.map(p=>world(p,1.966,1.006)),center=n.clone().multiplyScalar(r),base=n.clone().multiplyScalar(1.966);
  for(let i=0;i<top.length;i++){const j=(i+1)%top.length;tri(center,top[i],top[j]);quad(top[j],top[i],edge[i],edge[j]);quad(edge[j],edge[i],bottom[i],bottom[j]);tri(base,bottom[j],bottom[i]);}
 }
 const raw=new BufferGeometry();raw.setAttribute("position",new Float32BufferAttribute(positions,3));raw.setAttribute("normal",new Float32BufferAttribute(normals,3));raw.setAttribute("uv",new Float32BufferAttribute(uvs,2));const g=mergeVertices(raw,1e-6);raw.dispose();g.computeBoundingSphere();return g;
}
export function createBlackHole({wideDisc=false}={}){
 const root=new Group();root.name="hex-black-hole";const panels=createShellPanels(),shell=new Group();shell.name="matte-hex-sphere";root.add(shell);
 for(let i=0;i<3;i++){const material=new MeshStandardMaterial({color:["#070809","#0a0b0c","#0d0e10"][i],roughness:1,metalness:0});material.name=`matte-black-${i}`;shell.add(new Mesh(shellGeometry(panels.filter(p=>p.shade===i)),material));}
 const foundation=new Mesh(new SphereGeometry(1.985,48,32),new MeshStandardMaterial({color:"#020203",roughness:1,metalness:0}));foundation.name="opaque-foundation";shell.add(foundation);
 const orbit=new Group();orbit.name="tilted-accretion-disc";orbit.rotation.set(.10,0,-.20);root.add(orbit);
 const data=createAccretionBands({wide:wideDisc}),geometry=createHexagonalEarthGeometry(),transform=new Object3D(),color=new Color(),palette=wideDisc?["#df8d2c","#b97831","#8b6035","#68503b","#4a4034","#35332e","#25282a"]:["#df8d2c","#ac6c31","#68503b","#3d3730","#25282a"];
 const addBand=(tiles,material,name,speed)=>{
  const mesh=new InstancedMesh(geometry,material,tiles.length);mesh.name=name;mesh.userData.orbitSpeed=speed;
  tiles.forEach((tile,i)=>{transform.position.set(Math.sin(tile.angle)*tile.radius,tile.y,Math.cos(tile.angle)*tile.radius);transform.rotation.set(tile.tilt,tile.angle,-tile.tilt*.6);transform.scale.set(tile.size,tile.depth,tile.size*2/Math.sqrt(3));transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);color.setRGB(tile.shade,tile.shade,tile.shade);mesh.setColorAt(i,color);});mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();orbit.add(mesh);
 };
 data.bands.forEach((band,i)=>{const m=new MeshStandardMaterial({color:palette[i],roughness:.83,metalness:.12,emissive:i<2?"#bb5c09":"#000000",emissiveIntensity:i===0?.48:i===1?.12:0});m.name=`accretion-${i}`;addBand(band.tiles,m,`orbit-band-${i}`,band.speed);});
 const debrisMaterial=new MeshStandardMaterial({color:"#292c2e",roughness:.94,metalness:.05});debrisMaterial.name="loose-hex-debris";addBand(data.loose,debrisMaterial,"outer-debris",.18);
 root.userData.modelStats={panels:panels.length,hexagons:panels.filter(p=>p.points.length===6).length,pentagons:panels.filter(p=>p.points.length===5).length,discTiles:data.bands.reduce((s,b)=>s+b.tiles.length,0)+data.loose.length,draws:5+data.bands.length,triangles:0};root.traverse(n=>{if(n.isMesh)root.userData.modelStats.triangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3*(n.isInstancedMesh?n.count:1);});return root;
}
/** Only parent transforms change; orbit matrices/colors are uploaded once at construction. */
export function animateBlackHole(root,delta,reducedMotion=false){if(reducedMotion)return;const dt=Math.min(.1,Math.max(0,delta)),orbit=root.getObjectByName("tilted-accretion-disc");if(orbit)for(const band of orbit.children)band.rotation.y+=dt*band.userData.orbitSpeed;}
export function disposeBlackHole(root){const geometry=new Set(),materials=new Set();root.traverse(n=>{if(n.isMesh){if(n.isInstancedMesh)n.dispose();geometry.add(n.geometry);materials.add(n.material);}});geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
