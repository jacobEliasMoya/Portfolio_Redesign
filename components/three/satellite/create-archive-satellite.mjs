import {Box3,CylinderGeometry,ExtrudeGeometry,Group,Mesh,MeshStandardMaterial,Shape,Vector3,Matrix4} from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {mergeGeometries,mergeVertices} from "three/addons/utils/BufferGeometryUtils.js";
import {createHexHousingGeometry,createHexRingGeometry,createScreenGeometry,createDishGeometry} from "./satellite-geometry.mjs";
import {createArchiveScreenTexture} from "./satellite-screen.mjs";
import {JM_OUTLINES} from "../moon/jm-flag-outlines.mjs";

function hexPlate(radius,depth,bevel=.015){const s=new Shape();for(let i=0;i<6;i++){const a=i*Math.PI/3;if(i)s.lineTo(Math.cos(a)*radius,Math.sin(a)*radius);else s.moveTo(radius,0);}s.closePath();const raw=new ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1});raw.translate(0,0,-depth/2);const g=mergeVertices(raw,1e-6);raw.dispose();return g;}

/** Body width 2.7 / height 2.34 / depth 1.28; wing span 5.9.
 * Front depth stack: body .38, screen .43 (+.035 bulge), gasket .46, bezel .52 (lip .64).
 * Static detail is combined into material batches; local +Z is the screen face. */
export function createArchiveSatellite(){
 const root=new Group();root.name="archive-satellite";const screen=createArchiveScreenTexture();
 const material=(name,color,metalness,roughness,extra={})=>{const m=new MeshStandardMaterial({color,metalness,roughness,...extra});m.name=name;return m;};
 const mats={hull:material("graphite-shell","#656b6c",.6,.5),armor:material("silver-armor","#929491",.64,.43),pale:material("warm-bezel","#c4bba4",.38,.5),dark:material("recesses","#1c292f",.35,.66),cells:material("blue-solar-cells","#19364d",.48,.36),cellLight:material("blue-solar-variation","#24435b",.48,.38),lamps:material("cyan-status-lamps","#7bfff1",.1,.3,{emissive:"#36d1d0",emissiveIntensity:.65}),display:material("archive-display","#ffffff",.12,.24,{map:screen,emissiveMap:screen,emissive:"#ffffff",emissiveIntensity:.65})};
 const owned=new Set(),add=(geo,mat,position=[0,0,0],rotation=[0,0,0],scale=[1,1,1],parent=root)=>{owned.add(geo);const m=new Mesh(geo,mat);m.position.set(...position);m.rotation.set(...rotation);m.scale.set(...scale);parent.add(m);return m;};
 const box=(w,h,d,r=.025)=>new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/3,h/3,d/3));
 add(createHexHousingGeometry(),mats.hull);add(createHexRingGeometry(1.34,1.025,.24),mats.pale,[0,0,.52]);add(createHexRingGeometry(1.085,.98,.14),mats.dark,[0,0,.46]);add(createScreenGeometry(.985),mats.display,[0,0,.43]);
 // Panels sit on actual side tangent planes, leaving deliberate dark seams.
 const panel=box(1.20,.052,.47,.018),panelSmall=box(1.20,.052,.38,.018),screw=new CylinderGeometry(.022,.022,.018,6);
 for(let i=0;i<6;i++){
  const a=(i+.5)*Math.PI/3,n=new Vector3(Math.cos(a),Math.sin(a),0),t=new Vector3(Math.sin(a),-Math.cos(a),0),mount=new Group();mount.position.copy(n.clone().multiplyScalar(1.174));mount.rotation.z=a-Math.PI/2;root.add(mount);
  add(panel,mats.armor,[0,.015,-.33],[0,0,0],[1,1,1],mount);add(panelSmall,mats.hull,[0,.016,.13],[0,0,0],[1,1,1],mount);
  for(const x of [-.51,.51])for(const z of [-.49,.24])add(screw,mats.dark,[x,.049,z],[0,0,0],[1,1,1],mount);
  const p=n.clone().multiplyScalar(1.04).addScaledVector(t,.36);add(screw,mats.hull,[p.x,p.y,.651],[Math.PI/2,0,0]);
 }
 add(hexPlate(.63,.07),mats.armor,[0,0,-.925]);add(box(.62,.55,.055),mats.dark,[0,0,-.98]);const slat=box(.53,.035,.025,.005);for(let i=-2;i<=2;i++)add(slat,mats.hull,[0,i*.09,-1.02]);
 for(const y of [-.86,.86]){add(box(.63,.12,.04,.01),mats.dark,[0,y,-.89]);for(let i=-2;i<=2;i++)add(box(.065,.075,.025,.004),mats.hull,[i*.11,y,-.917]);}
 const wingBack=hexPlate(.79,.09),wingFrame=createHexRingGeometry(.80,.69,.075),cell=hexPlate(.218,.018,.008),axle=new CylinderGeometry(.095,.095,.47,6),pivot=new CylinderGeometry(.16,.16,.25,6),bolt=new CylinderGeometry(.085,.085,.032,6);
 for(const side of [-1,1]){
  add(box(.24,.44,.37),mats.dark,[side*1.3,0,-.15]);add(axle,mats.armor,[side*1.54,0,-.15],[0,0,Math.PI/2]);add(pivot,mats.hull,[side*1.55,0,-.15],[Math.PI/2,0,0]);add(bolt,mats.pale,[side*1.55,0,-.007],[Math.PI/2,0,0]);
  const wing=new Group();wing.position.set(side*2.17,0,-.15);wing.rotation.y=-side*.14;root.add(wing);
  add(wingBack,mats.dark,[0,0,0],[0,0,0],[1,1,1],wing);add(wingFrame,mats.pale,[0,0,.057],[0,0,0],[1,1,1],wing);
  const centers=[[0,0],...Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return [Math.cos(a)*.405,Math.sin(a)*.405];})];centers.forEach(([x,y],i)=>add(cell,i%3===0?mats.cellLight:mats.cells,[x,y,.064],[0,0,0],[1,1,1],wing));add(hexPlate(.64,.025),mats.hull,[0,0,-.07],[0,0,0],[1,1,1],wing);
 }
 add(box(.42,.11,.47),mats.dark,[-.27,1.19,-.15]);add(new CylinderGeometry(.13,.19,.20,6),mats.armor,[-.27,1.32,-.15]);const dish=new Group();dish.position.set(-.27,1.46,-.15);dish.rotation.set(.83,0,-.24);root.add(dish);
 add(createDishGeometry(),mats.armor,[0,0,0],[0,0,0],[1,1,1],dish);add(new CylinderGeometry(.027,.04,.43,6),mats.dark,[0,.26,0],[0,0,0],[1,1,1],dish);add(hexPlate(.075,.07),mats.pale,[0,.49,0],[Math.PI/2,0,0],[1,1,1],dish);
 add(new CylinderGeometry(.055,.085,.13,6),mats.pale,[.62,1.22,-.22]);add(new CylinderGeometry(.018,.026,.65,6),mats.armor,[.62,1.59,-.22]);add(new CylinderGeometry(.025,.025,.065,6),mats.lamps,[.62,1.94,-.22]);
 for(const x of [-.30,.30])add(box(.055,.26,.28,.015),mats.armor,[x,-1.22,-.15]);add(new CylinderGeometry(.28,.19,.26,6),mats.hull,[0,-1.30,-.15]);add(box(.19,.07,.04,.01),mats.lamps,[0,-1.36,.025]);
 for(const x of [-.22,0,.22]){add(box(.13,.105,.025,.009),mats.dark,[x,-1.025,.655]);add(box(.085,.059,.025,.007),mats.lamps,[x,-1.025,.674]);}add(box(.27,.025,.018,.004),mats.dark,[-.57,-.89,.653]);
 const sideMount=(angle,z)=>{const n=new Vector3(Math.cos(angle),Math.sin(angle),0),up=new Vector3(-Math.sin(angle),Math.cos(angle),0),right=new Vector3(0,0,-1),group=new Group();group.position.copy(n).multiplyScalar(1.215);group.position.z=z;group.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(right,up,n));root.add(group);return group;};
 const badge=sideMount(-Math.PI/6,.03);add(hexPlate(.19,.025),mats.pale,[0,0,0],[0,0,0],[1,1,1],badge);
 for(const outline of JM_OUTLINES){const s=new Shape();outline.forEach(([x,y],i)=>{if(i)s.lineTo(x,y);else s.moveTo(x,y);});s.closePath();add(new ExtrudeGeometry(s,{depth:.008,bevelEnabled:false}),mats.dark,[0,0,.024],[0,0,0],[.84,.84,1],badge);}
 const status=sideMount(Math.PI/6,.05);for(let i=0;i<3;i++){add(box(.16,.065,.025,.006),mats.dark,[0,i*.13,0],[0,0,0],[1,1,1],status);add(box(.115,.025,.02,.004),mats.lamps,[0,i*.13,.02],[0,0,0],[1,1,1],status);}
 root.updateMatrixWorld(true);const buckets=new Map();root.traverse(node=>{if(!node.isMesh)return;let geo=node.geometry.clone().applyMatrix4(node.matrixWorld);if(geo.index){const flat=geo.toNonIndexed();geo.dispose();geo=flat;}if(!buckets.has(node.material))buckets.set(node.material,[]);buckets.get(node.material).push(geo);});root.clear();let triangles=0;
 for(const [mat,parts] of buckets){const merged=mergeGeometries(parts,false),indexed=mergeVertices(merged,1e-6);triangles+=(indexed.index?.count??indexed.attributes.position.count)/3;const mesh=new Mesh(indexed,mat);mesh.name=mat.name;root.add(mesh);parts.forEach(g=>g.dispose());merged.dispose();}owned.forEach(g=>g.dispose());root.userData.modelStats={draws:root.children.length,triangles,bounds:new Box3().setFromObject(root).getSize(new Vector3()).toArray()};return root;
}
export function disposeArchiveSatellite(root){const textures=new Set(),materials=new Set();root.traverse(node=>{if(!node.isMesh)return;node.geometry.dispose();materials.add(node.material);});for(const m of materials){if(m.map)textures.add(m.map);if(m.emissiveMap)textures.add(m.emissiveMap);m.dispose();}textures.forEach(t=>t.dispose());}
