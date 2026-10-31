/** Offline sample of the actual HUD text geometry, not a browser screenshot. */
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
import {Group} from "three";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import {createHudLetterResources,createHudLetterModel,stepHudLetterModel} from "../components/three/ufo/hud-letter-model.mjs";
import {serializeThreeAsset} from "./serialize-three-asset.mjs";
const font=new FontLoader().parse(JSON.parse(await readFile("public/fonts/sabo-filled.typeface.json","utf8"))),root=new Group();
const resources=createHudLetterResources(font);
for(const [text,y,size,color] of [["JAKE’S SPACE",2,1,"#e8eadc"],["L / LAUNCH",.6,.7,"#50edf1"],["HOME   JAKE   SPACE   EARTH   MOON",-.6,.4,"#e8eadc"]]){
 const model=createHudLetterModel(resources,text,{fontSize:size,color});model.position.y=y;
 stepHudLetterModel(model,{elapsed:1,delta:1/60,pointer:{x:0,y:0,active:false},origin:{x:0,y:0}});root.add(model);
}
const output=resolve(process.argv[2]??"docs/references/corner-hud-lettering/lettering.png"),folder=join(tmpdir(),"portfolio-hud-lettering");await mkdir(folder,{recursive:true});await mkdir(resolve(output,".."),{recursive:true});const file=join(folder,"lettering.json");await writeFile(file,JSON.stringify({name:"hud-lettering",...serializeThreeAsset(root),view:[.15,.12,9],width:1200,height:520}));
const run=spawnSync(process.env.BLENDER_EXECUTABLE??"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe",["--background","--factory-startup","--python-exit-code","1","--python",resolve("scripts/render-hud-icons.py"),"--",file,output],{stdio:"inherit",windowsHide:true});if(run.error)throw run.error;process.exitCode=run.status??1;
