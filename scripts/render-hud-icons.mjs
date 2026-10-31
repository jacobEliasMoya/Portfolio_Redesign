/** Deterministic transparent HUD images from the actual project models. */
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {tmpdir} from "node:os";
import {resolve,join} from "node:path";
import {spawnSync} from "node:child_process";
import {Matrix4,Group,Mesh,CylinderGeometry,BoxGeometry,RingGeometry,MeshStandardMaterial,MeshBasicMaterial,Object3D,Color,Vector3,SRGBColorSpace} from "three";
import {createUFOV3,disposeUFOV3} from "../components/three/ufo/create-ufo-v3.mjs";
import {createHexagonalEarthGeometry} from "../components/three/planet/hexagonal-earth-geometry.mjs";
import {impactFixture} from "./impact-fixture.mjs";
import {serializeThreeAsset} from "./serialize-three-asset.mjs";
const output=resolve(process.argv[2]??"public/images/hud"),work=join(tmpdir(),"portfolio-hud-icons");
await mkdir(output,{recursive:true});await mkdir(work,{recursive:true});
const jobs=[];
function pad(){
 const group=new Group(),add=(g,m,p=[0,0,0],r=[0,0,0])=>{const mesh=new Mesh(g,m);mesh.position.set(...p);mesh.rotation.set(...r);group.add(mesh);},mat=(color,roughness=.9,metalness=.15)=>new MeshStandardMaterial({color,roughness,metalness});
 // Same deck dimensions, hex tile layout, colors and accents as LunarLandingPad.
 add(new CylinderGeometry(.56,.59,.12,6),mat("#30383b"),[0,-.04,0]);add(new CylinderGeometry(.535,.535,.012,6),mat("#43494a",.94),[0,.024,0]);
 let index=0;for(let row=-4;row<=4;row++)for(let col=-4;col<=4;col++){const x=(col+(Math.abs(row)%2)*.5)*.142,z=row*.1065;if(Math.hypot(x,z)>=.44)continue;const gray=.10+(index++%5)*.012,m=new MeshStandardMaterial({color:new Color(gray,gray*1.05,gray*1.08),roughness:.95,metalness:.12});const mesh=new Mesh(createHexagonalEarthGeometry(),m);mesh.position.set(x,.036,z);mesh.scale.set(.148,.014,.148);group.add(mesh);}
 for(let i=0;i<6;i++){const a=i*Math.PI/3,part=new Group();part.rotation.y=a;group.add(part);const accent=new Mesh(new BoxGeometry(.10,.022,.014),new MeshStandardMaterial({color:"#66e8ef",emissive:"#1cbacb",emissiveIntensity:1.1}));accent.position.set(0,-.018,.496);part.add(accent);const seam=new Mesh(new BoxGeometry(.012,.004,.37),mat("#242b2e",1,0));seam.position.set(0,.033,.28);seam.rotation.y=Math.PI/6;part.add(seam);}
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;add(new RingGeometry(.025,.035,6),new MeshBasicMaterial({color:"#60dbe4"}),[Math.sin(a)*.30625,.048,Math.cos(a)*.30625],[-Math.PI/2,0,0]);}
 return group;
}
for(const parked of [false,true]){
 const ship=createUFOV3(),root=new Group();root.add(ship);
 if(parked){ship.getObjectByName("v3-gear").visible=true;const deck=pad();deck.scale.setScalar(.8/.38);deck.position.y=-1.1-.024*(.8/.38);root.add(deck);}
 const name=parked?"saucer-parked":"saucer-flight";jobs.push({name,...serializeThreeAsset(root),view:[.12,3.4,9],width:512,height:320});disposeUFOV3(ship);
}
const tile=createHexagonalEarthGeometry();
for(const kind of ["earth","moon"]){
 const data=JSON.parse(await readFile(`public/models/${kind}/block-${kind}.json`,"utf8")),t=new Object3D(),normal=new Vector3(),up=new Vector3(0,1,0),color=new Color(),matrices=[],colors=[];
 for(let i=0;i<data.sizes.length;i++){
  t.position.fromArray(data.positions,i*3);normal.fromArray(data.normals,i*3).normalize();t.quaternion.setFromUnitVectors(up,normal);const spread=kind==="moon"?(data.tileTangentScale??1.65):1.4,depth=kind==="moon"?(data.tileDepthScale??1.15):1.15;t.scale.set(data.sizes[i]*spread,data.sizes[i]*depth,data.sizes[i]*spread);t.updateMatrix();matrices.push(...t.matrix.elements);color.setRGB(data.colors[i*3],data.colors[i*3+1],data.colors[i*3+2],SRGBColorSpace);colors.push(...color.toArray());
 }
 const skin=data.skin?{positions:data.skin.positions,indices:data.skin.indices,colors:[]}:null;
 if(skin)for(let i=0;i<data.skin.colors.length;i+=3){color.setRGB(...data.skin.colors.slice(i,i+3),SRGBColorSpace);skin.colors.push(...color.toArray());}
 jobs.push({name:kind,materials:[],meshes:[],textures:[],instances:{positions:Array.from(tile.attributes.position.array),indices:Array.from(tile.index.array),matrices,colors,facetCorners:data.facetCorners??null,depthScale:data.tileDepthScale??1.15},skin,core:kind==="earth"?2.94:(data.foundation??.70),view:kind==="earth"?[1,1,9]:[0,.4,9],width:256,height:256});
}
tile.dispose();
if(process.argv.includes("--crater-review")){
 for(const job of jobs.filter(item=>["earth","moon"].includes(item.name))){
  const f=impactFixture(job.name),r=f.data.radius;
  f.target.query(new Vector3(0,0,r*2),new Vector3(),0)?.destroy(job.name==="earth"?.85:.65);
  job.instances.matrices=Array.from(f.mesh.instanceMatrix.array);job.instances.colors=Array.from(f.mesh.instanceColor.array);
  if(job.name==="moon"){
   const matrix=new Matrix4(),point=new Vector3(),corners=[];
   for(let i=0;i<f.mesh.count;i++){matrix.fromArray(f.mesh.instanceMatrix.array,i*16);for(let c=0;c<6;c++){point.fromBufferAttribute(f.mesh.geometry.getAttribute(`lunarPoint${c}`),i).applyMatrix4(matrix);corners.push(...point.toArray());}}
   job.instances.facetCorners=corners;job.skin.positions=Array.from(f.skin.attributes.position.array);
  }
  const root=new Group();root.add(new Mesh(f.core,new MeshStandardMaterial({color:job.name==="earth"?"#073775":"#85838a",roughness:.95})));
  const core=serializeThreeAsset(root);job.meshes=core.meshes;job.materials=core.materials;job.core=0;
  job.width=768;job.height=768;job.view=[2,1,9];job.name+="-impact";f.dispose();
 }
}

if(process.argv.includes("--moon-review")){
 const moon=jobs.find(job=>job.name==="moon");jobs.length=0;
 for(const [name,view] of [["front",[0,.4,9]],["three-quarter",[5,2,8]],["side",[9,.4,0]],["rear",[0,.4,-9]]])jobs.push({...moon,name:"moon-"+name,view,width:768,height:768});
}
for(const job of jobs.filter(job=>(!process.argv.includes("--ships")||job.name.startsWith("saucer"))&&(!process.argv.includes("--moon")||job.name==="moon")&&(!process.argv.includes("--crater-review")||job.name.endsWith("-impact")))){const file=join(work,job.name+".json");await writeFile(file,JSON.stringify(job));const run=spawnSync(process.env.BLENDER_EXECUTABLE??"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe",["--background","--factory-startup","--python-exit-code","1","--python",resolve("scripts/render-hud-icons.py"),"--",file,join(output,job.name+".png")],{stdio:"inherit",windowsHide:true});if(run.error)throw run.error;if(run.status!==0)throw new Error(`HUD render failed: ${job.name}`);}
console.log("Exact-model HUD PNGs saved to",output);
