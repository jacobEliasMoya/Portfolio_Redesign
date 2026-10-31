/** Offline review of the exact instanced block asset; HTML guide text is not pictured. */
import {mkdir,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
import {Color,Group,Matrix4,Mesh} from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {createGuideBoardModel,updateGuideBoardModel} from "../components/three/ufo/guide-board-model.mjs";
import {createGuideBoardCamera,resizeGuideBoardCamera} from "../components/three/ufo/guide-board-projection.mjs";
import {serializeThreeAsset} from "./serialize-three-asset.mjs";
const camera=createGuideBoardCamera();resizeGuideBoardCamera(camera,1000,900);
function preview(progress){
const model=createGuideBoardModel(904,544);updateGuideBoardModel(model,progress,camera.position.z);
const root=new Group(),colors=new Map(),matrix=new Matrix4(),tint=new Color();root.scale.setScalar(.01);
for(let index=0;index<model.tiles.count;index++){
 model.tiles.getMatrixAt(index,matrix);if(Math.abs(matrix.determinant())<1e-12)continue;model.tiles.getColorAt(index,tint);const key=tint.getHexString();
 if(!colors.has(key))colors.set(key,{color:tint.clone(),pieces:[]});colors.get(key).pieces.push(model.geometry.clone().applyMatrix4(matrix));
}
for(const {color,pieces} of colors.values()){
 const material=model.material.clone();material.color.copy(color);root.add(new Mesh(mergeGeometries(pieces),material));pieces.forEach(geometry=>geometry.dispose());
}
if(model.backing.visible)root.add(model.backing.clone());
return {root,model};
}
const folder=resolve(process.argv[2]??"docs/references/guide-board"),temporary=join(tmpdir(),"portfolio-guide-board");await mkdir(folder,{recursive:true});await mkdir(temporary,{recursive:true});
for(const [name,view,progress] of [["gather-early",[.05,.05,10],.13],["gather-mid",[.05,.05,10],.38],["front",[.05,.05,10],1],["depth",[4,3,9],1]]){
 const {root,model}=preview(progress);
 const perspective=name==="depth"?undefined:{fov:camera.fov,position:[0,0,camera.position.z*.01],near:camera.near*.01,far:camera.far*.01};
 const file=join(temporary,`${name}.json`);await writeFile(file,JSON.stringify({name:"guide-board",...serializeThreeAsset(root),frame:{center:[0,0,0],span:10.6},view,width:1000,height:900,perspective}));
 const result=spawnSync(process.env.BLENDER_EXECUTABLE??"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe",["--background","--factory-startup","--python-exit-code","1","--python",resolve("scripts/render-hud-icons.py"),"--",file,join(folder,`${name}.png`)],{stdio:"inherit",windowsHide:true});if(result.error)throw result.error;if(result.status)process.exit(result.status);
 model.dispose();
}
