import {Box3,CylinderGeometry,Group,LatheGeometry,Mesh,MeshStandardMaterial,MeshPhysicalMaterial,Object3D,Vector2,Vector3} from "three";
import {mergeGeometries,mergeVertices} from "three/addons/utils/BufferGeometryUtils.js";
import {createHexagonalEarthGeometry} from "../planet/hexagonal-earth-geometry.mjs";
import {createHexCanopy} from "./hexagonal-canopy-geometry.mjs";
import {addAlienCannon} from "./alien-cannon.mjs";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
const noise=(x,z)=>{const a=Math.sin(x*127.1+z*311.7)*43758.5453;return a-Math.floor(a);};
const upper=[[0,.43],[.82,.43],[1.1,.38],[1.6,.25],[1.95,.13],[2.23,.045]],lower=[[0,-.43],[.65,-.43],[1.2,-.34],[1.7,-.22],[2.23,-.065]];
function sample(profile,r){for(let i=1;i<profile.length;i++)if(r<=profile[i][0]){const [a,y]=profile[i-1],[b,z]=profile[i],slope=(z-y)/(b-a);return {y:y+slope*(r-a),slope};}return {y:profile.at(-1)[1],slope:0};}
/** Point-up regular hex grid. Broad overlapping plates, fitted to shallow saucer slopes. */
export function referenceArmorTiles(){const tiles=[];
 for(const side of [1,-1]){const width=side===1?.43:.55,height=width*2/Math.sqrt(3),step=width*.985;
  for(let row=-9;row<=9;row++)for(let col=-9;col<=9;col++){
   const x=(col+(Math.abs(row)%2)*.5)*step,z=row*height*.75*.985,r=Math.hypot(x,z);
   if(r>2.23-width*.43||r<(side===1?.80:.62))continue;
   if(side<0&&[0,1,2].some(i=>Math.hypot(x-Math.sin(i*Math.PI*2/3)*1.26,z-Math.cos(i*Math.PI*2/3)*1.26)<.19))continue;
   const s=sample(side===1?upper:lower,r),depth=(side===1?.13:.13)+noise(row,col)*.045,relief=noise(row+17,col+5)*(side===1?.045:.035);
   tiles.push({x,y:s.y+side*(depth*.30+relief),z,width:width*(1+noise(col,row)*.025),height:height*(1+noise(col,row)*.025),depth,normal:[-s.slope*x/(r||1)*side,side,-s.slope*z/(r||1)*side],shade:Math.floor(noise(row+4,col+9)*5),side});
  }
 }return tiles;}
function lathe(profile,segments=48){return new LatheGeometry(profile.map(p=>new Vector2(...p)),segments);}
function batch(group){group.updateMatrixWorld(true);const buckets=new Map();group.traverse(n=>{if(!n.isMesh)return;let g=n.geometry.clone().applyMatrix4(n.matrixWorld);if(g.index){const f=g.toNonIndexed();g.dispose();g=f;}if(!buckets.has(n.material))buckets.set(n.material,[]);buckets.get(n.material).push(g);});group.clear();for(const [m,parts] of buckets){const joined=mergeGeometries(parts,false),indexed=mergeVertices(joined,1e-6),mesh=new Mesh(indexed,m);mesh.name=m.name;group.add(mesh);joined.dispose();parts.forEach(g=>g.dispose());}}
/** Independent variant. Same radius, +Z front, emitter and landing clearance as current ship. */
export function createReferenceUFO(){
 const root=new Group(),rotor=new Group(),fixed=new Group(),gear=new Group();root.name="reference-ufo";rotor.name="reference-disc";fixed.name="reference-cockpit";gear.name="reference-gear";
 const mat=(name,color,metalness=.48,roughness=.58,extra={})=>{const m=new MeshStandardMaterial({color,metalness,roughness,...extra});m.name=name;return m;};
 const steel=mat("satin-steel","#8d928f",.62,.44),dark=mat("graphite-recess","#15232b",.45,.58),rim=mat("rim-metal","#626d72",.7,.35),light=mat("cyan-navigation","#74f9ff",.2,.3,{emissive:"#1edce9",emissiveIntensity:1.25}),coreLight=mat("cyan-engine","#4ee7f1",.2,.3,{emissive:"#1cbfcf",emissiveIntensity:.8});
 const palette=["#737b7b","#92978f","#9da198","#858d87","#657071"].map((c,i)=>mat(`armor-${i}`,c,.45,.65));
 const owned=new Set(),add=(g,m,p=[0,0,0],r=[0,0,0],s=[1,1,1],parent=fixed)=>{owned.add(g);const mesh=new Mesh(g,m);mesh.position.set(...p);mesh.rotation.set(...r);mesh.scale.set(...s);parent.add(mesh);return mesh;};
 const box=(w,h,d)=>new RoundedBoxGeometry(w,h,d,1,Math.min(.018,w/4,h/4,d/4));
 add(lathe([[0,-.42],[.6,-.42],[1.25,-.32],[1.95,-.15],[2.23,-.07],[2.23,.07],[1.95,.14],[1.25,.35],[.78,.44],[0,.44]]),dark,[0,0,0],[0,0,0],[1,1,1],rotor);
 const tileGeometry=createHexagonalEarthGeometry(),t=new Object3D(),up=new Vector3(0,1,0);
 const tiles=referenceArmorTiles();for(const tile of tiles){t.position.set(tile.x,tile.y,tile.z);t.quaternion.setFromUnitVectors(up,new Vector3(...tile.normal).normalize());t.scale.set(tile.width,tile.depth,tile.height);t.updateMatrix();const g=tileGeometry.clone().applyMatrix4(t.matrix);add(g,palette[tile.shade],[0,0,0],[0,0,0],[1,1,1],rotor);}tileGeometry.dispose();
 add(new CylinderGeometry(2.245,2.245,.16,48,1,true),dark,[0,0,0],[0,0,0],[1,1,1],rotor);
 for(const y of [-.083,.083])add(lathe([[2.20,-.010],[2.245,-.010],[2.25,0],[2.245,.010],[2.20,.010]],48),rim,[0,y,0],[0,0,0],[1,1,1],rotor);
 const socket=box(.255,.075,.04),lamp=box(.205,.042,.025);
 for(let i=0;i<16;i++){const a=i*Math.PI/8,p=[Math.sin(a)*2.253,0,Math.cos(a)*2.253];add(socket,rim,p,[0,a,0],[1,1,1],rotor);add(lamp,light,[Math.sin(a)*2.275,0,Math.cos(a)*2.275],[0,a,0],[1,1,1],rotor);}
 // Recessed engine well: silver annulus, dark inner wall, cyan ring and hex core.
 add(lathe([[.60,-.40],[.61,-.47],[.56,-.52],[.43,-.52],[.39,-.46],[.39,-.38]] ,24),steel,[0,0,0],[0,0,0],[1,1,1],rotor);
 add(lathe([[.47,-.50],[.46,-.525],[.40,-.525],[.39,-.49]],24),coreLight,[0,0,0],[0,0,0],[1,1,1],rotor);
 add(new CylinderGeometry(.29,.29,.025,6),coreLight,[0,-.465,0],[0,0,0],[1,1,1],rotor);
 // Three fixed vent housings with dark wells and spaced louvers.
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3,x=Math.sin(a)*1.26,z=Math.cos(a)*1.26;
  add(new CylinderGeometry(.30,.28,.12,12),steel,[x,-.43,z]);add(new CylinderGeometry(.235,.235,.027,12),dark,[x,-.502,z]);
  for(let j=-2;j<=2;j++)add(box(Math.sqrt(Math.max(0,.21**2-(j*.07)**2))*2,.016,.024),rim,[x,-.521,z+j*.07]);
  const leg=new Group();leg.rotation.y=a;gear.add(leg);add(new CylinderGeometry(.07,.027,.67,6),steel,[0,-.74,1.32],[-.22,0,0],[1,1,1],leg);add(new CylinderGeometry(.115,.15,.055,6),dark,[0,-1.10,1.395],[0,0,0],[1,1,1],leg);
 }
 // Continuous beveled cockpit collar closes irregular gaps between the armor and sill.
 add(lathe([[.74,.425],[.88,.425],[.925,.46],[.91,.49],[.845,.525],[.77,.525],[.74,.49],[.74,.425]],24),steel);
 add(lathe([[.765,.50],[.795,.50],[.805,.515],[.795,.53],[.765,.53],[.765,.50]],24),dark);
 add(new CylinderGeometry(.79,.83,.08,12),rim,[0,.47,0]);add(new CylinderGeometry(.70,.70,.024,12),dark,[0,.51,0]);
 const canopy=createHexCanopy(),glass=new MeshPhysicalMaterial({color:"#07596f",metalness:.26,roughness:.19,clearcoat:.85,clearcoatRoughness:.18});glass.name="teal-faceted-glass";canopy.frame.computeVertexNormals();add(canopy.glass,glass);add(canopy.frame,steel);
 add(box(.23,.22,.18),dark,[0,.62,-.15]);
 const weaponRotor=new Group();weaponRotor.name="alien-cannon-rotor";
 addAlienCannon(add,{metal:steel,dark,trim:rim,cyan:light},(g,m,p,r)=>add(g,m,p,r,[1,1,1],weaponRotor));
 batch(rotor);batch(fixed);batch(gear);batch(weaponRotor);root.add(rotor,fixed,gear,weaponRotor);owned.forEach(g=>g.dispose());
 const bounds=new Box3().setFromObject(root);root.userData.modelStats={tiles:tiles.length,upperTiles:tiles.filter(t=>t.side>0).length,draws:rotor.children.length+fixed.children.length+gear.children.length+weaponRotor.children.length,triangles:0,bounds:bounds.getSize(new Vector3()).toArray()};root.traverse(n=>{if(n.isMesh)root.userData.modelStats.triangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3;});gear.visible=false;return root;
}
export function disposeReferenceUFO(root){const materials=new Set();root.traverse(n=>{if(n.isMesh){n.geometry.dispose();materials.add(n.material);}});materials.forEach(m=>m.dispose());}
