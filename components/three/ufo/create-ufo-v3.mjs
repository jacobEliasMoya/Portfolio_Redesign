import {Box3,Float32BufferAttribute,CylinderGeometry,Group,Mesh,MeshPhysicalMaterial,MeshStandardMaterial,Vector3} from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {mergeGeometries,mergeVertices} from "three/addons/utils/BufferGeometryUtils.js";
import {createHexCanopy} from "./hexagonal-canopy-geometry.mjs";
import {createHexLoft,createV3PanelLayout,createV3PanelGeometry,V3_RADIUS} from "./ufo-v3-geometry.mjs";

function batch(group,fragments=false){let fragmentIndex=0;group.updateMatrixWorld(true);const buckets=new Map();group.traverse(n=>{if(!n.isMesh)return;let g=n.geometry.clone().applyMatrix4(n.matrixWorld);if(g.index){const raw=g.toNonIndexed();g.dispose();g=raw;}if(fragments){
 const pos=g.attributes.position;g.computeBoundingBox();const size=g.boundingBox.getSize(new Vector3()),split=Math.max(size.x,size.z)>1.5,sectors=new Map(),triangleKeys=[];
 // Large continuous rails/foundation separate into six sectors; armor stays intact.
 for(let i=0;i<pos.count;i+=3){const x=(pos.getX(i)+pos.getX(i+1)+pos.getX(i+2))/3,z=(pos.getZ(i)+pos.getZ(i+1)+pos.getZ(i+2))/3,key=split?Math.floor((Math.atan2(z,x)+Math.PI)/(Math.PI/3))%6:0;triangleKeys.push(key);if(!sectors.has(key))sectors.set(key,{sum:new Vector3(),count:0,id:fragmentIndex++});const part=sectors.get(key);for(let j=0;j<3;j++){part.sum.add(new Vector3().fromBufferAttribute(pos,i+j));part.count++;}}
 for(const part of sectors.values())part.sum.divideScalar(part.count);
 const centers=new Float32Array(pos.count*3),ids=new Float32Array(pos.count);for(let i=0;i<pos.count;i++){const part=sectors.get(triangleKeys[Math.floor(i/3)]);part.sum.toArray(centers,i*3);ids[i]=part.id;}
 g.setAttribute("aFragmentCenter",new Float32BufferAttribute(centers,3));g.setAttribute("aFragmentIndex",new Float32BufferAttribute(ids,1));
 }if(!buckets.has(n.material))buckets.set(n.material,[]);buckets.get(n.material).push(g);});group.clear();for(const [material,parts] of buckets){const joined=mergeGeometries(parts,false),g=mergeVertices(joined,1e-6),mesh=new Mesh(g,material);mesh.name=material.name;group.add(mesh);joined.dispose();parts.forEach(p=>p.dispose());}}

/** Option 3: a six-sided shallow hull with real clipped armor/cavity outlines. +Z is front. */
export function createUFOV3({fragments=false}={}){
 const root=new Group(),disc=new Group(),fixed=new Group(),gear=new Group();root.name="ufo-v3";disc.name="v3-disc";fixed.name="v3-cockpit";gear.name="v3-gear";
 const material=(name,color,metalness=.5,roughness=.5,extra={})=>{const m=new MeshStandardMaterial({color,metalness,roughness,...extra});m.name=name;return m;};
 const metal=material("v3-metal","#969b94",.64,.43),dark=material("v3-recess","#18252a",.4,.64),trim=material("v3-trim","#646e70",.7,.37),cyan=material("v3-navigation","#75eef4",.15,.28,{emissive:"#19cbd5",emissiveIntensity:1.1}),core=material("v3-engine","#57e3ef",.2,.3,{emissive:"#12c8d9",emissiveIntensity:.8}),armor=["#9ba096","#8b938d","#a8aba0","#7b8680","#969b90"].map((c,i)=>material(`v3-armor-${i}`,c,.48,.57));
 const owned=new Set(),add=(g,m,p=[0,0,0],r=[0,0,0],s=[1,1,1],parent=fixed)=>{owned.add(g);const mesh=new Mesh(g,m);mesh.position.set(...p);mesh.rotation.set(...r);mesh.scale.set(...s);parent.add(mesh);return mesh;},box=(x,y,z)=>new RoundedBoxGeometry(x,y,z,1,Math.min(.015,x/4,y/4,z/4));
 // Six-sided continuous foundation. Beveled shoulders, opaque front and back.
 add(createHexLoft([[0,.47],[.82,.47],[1.4,.34],[2.15,.12],[V3_RADIUS,.07],[V3_RADIUS,-.09],[2.16,-.15],[1.35,-.32],[.65,-.40],[0,-.40]]),dark,[0,0,0],[0,0,0],[1,1,1],disc);
 const top=createV3PanelLayout(1),bottom=createV3PanelLayout(-1);for(const panel of [...top,...bottom])add(createV3PanelGeometry(panel),armor[panel.shade],[0,0,0],[0,0,0],[1,1,1],disc);
 // Faceted belt and rails follow the actual hex plan; no round torus at the edge.
 add(createHexLoft([[2.205,.075],[2.235,.06],[2.235,-.08],[2.205,-.095],[2.19,-.075],[2.19,.06]],true),dark,[0,0,0],[0,0,0],[1,1,1],disc);
 for(const y of [.083,-.10])add(createHexLoft([[2.17,y+.012],[2.23,y+.012],[2.25,y],[2.23,y-.012],[2.17,y-.012]],true),metal,[0,0,0],[0,0,0],[1,1,1],disc);
 // Six broad flush light apertures, one per face, centered on its normal.
 const apothem=2.235*Math.sqrt(3)/2;
 for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3,x=Math.cos(a),z=Math.sin(a),yaw=Math.atan2(x,z);
  add(box(.36,.092,.035),trim,[x*(apothem+.006),-.006,z*(apothem+.006)],[0,yaw,0],[1,1,1],disc);
  add(box(.28,.045,.016),cyan,[x*(apothem+.029),-.006,z*(apothem+.029)],[0,yaw,0],[1,1,1],disc);
  // Small seam keys anchor the front/rear panel transitions.
  add(box(.055,.18,.04),trim,[x*(apothem+.005)+z*.74,-.006,z*(apothem+.005)-x*.74],[0,yaw,0],[1,1,1],disc);
 }
 // Hex-on-hex engine recess, with separated six-sided trim and an inset aperture.
 add(createHexLoft([[.63,-.37],[.67,-.40],[.65,-.47],[.58,-.53],[.43,-.53],[.39,-.46],[.39,-.36]],true),trim,[0,0,0],[0,0,0],[1,1,1],disc);
 add(createHexLoft([[.53,-.49],[.51,-.535],[.43,-.535],[.41,-.49]],true),core,[0,0,0],[0,0,0],[1,1,1],disc);
 add(createHexLoft([[0,-.47],[.30,-.47],[.31,-.48],[.30,-.50],[0,-.50]]),core,[0,0,0],[0,0,0],[1,1,1],disc);
 // Three hexagonal vent wells fit the clipped armor holes. The landing gear stays fixed.
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3,x=Math.sin(a)*1.22,z=Math.cos(a)*1.22;
  add(createHexLoft([[.265,-.34],[.305,-.38],[.305,-.45],[.26,-.49],[.225,-.49],[.225,-.37]],true),metal,[x,0,z]);
  add(createHexLoft([[0,-.445],[.225,-.445],[.225,-.46],[0,-.46]]),dark,[x,0,z]);
  for(let j=-2;j<=2;j++)add(box(j===0?.34:.28,.014,.026),trim,[x,-.477,z+j*.065]);
  const leg=new Group();leg.rotation.y=a;gear.add(leg);add(new CylinderGeometry(.07,.027,.67,6),metal,[0,-.74,1.32],[-.22,0,0],[1,1,1],leg);add(new CylinderGeometry(.115,.15,.055,6),dark,[0,-1.10,1.395],[0,0,0],[1,1,1],leg);
 }
 // A true six-sided collar joins the shallow hull to the paneled glass dome.
 add(createHexLoft([[.77,.43],[.89,.43],[.94,.48],[.90,.535],[.79,.535],[.755,.49]],true),metal);
 add(createHexLoft([[.76,.50],[.795,.50],[.81,.525],[.795,.54],[.76,.54]],true),dark);
 const canopy=createHexCanopy();canopy.frame.computeVertexNormals();const glass=new MeshPhysicalMaterial({color:"#075a72",metalness:.24,roughness:.18,clearcoat:.9,clearcoatRoughness:.16});glass.name="v3-teal-glass";add(canopy.glass,glass);add(canopy.frame,metal);
 add(new CylinderGeometry(.70,.70,.022,12),dark,[0,.49,0]);add(box(.23,.22,.18),dark,[0,.62,-.15]);
 // Long enough to join a flat nose edge while preserving the +Z projectile convention.
 add(new CylinderGeometry(.18,.24,.48,6),metal,[0,.24,2.10],[Math.PI/2,0,0]);add(new CylinderGeometry(.145,.18,.12,6),dark,[0,.24,2.38],[Math.PI/2,0,0]);add(new CylinderGeometry(.10,.10,.02,6),cyan,[0,.24,2.45],[Math.PI/2,0,0]);
 batch(disc,fragments);batch(fixed,fragments);batch(gear,fragments);root.add(disc,fixed,gear);owned.forEach(g=>g.dispose());
 const stats={panels:top.length+bottom.length,upperPanels:top.length,draws:0,triangles:0,bounds:new Box3().setFromObject(root).getSize(new Vector3()).toArray()};root.traverse(n=>{if(n.isMesh){stats.draws++;stats.triangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3;}});root.userData.modelStats=stats;gear.visible=false;return root;
}
export function disposeUFOV3(root){const mats=new Set();root.traverse(n=>{if(n.isMesh){n.geometry.dispose();mats.add(n.material);}});mats.forEach(m=>m.dispose());}
