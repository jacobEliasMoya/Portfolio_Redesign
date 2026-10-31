/** Offline geometry review of the exact Sabo particle word, not a HUD capture. */
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import {createWeaponNoticeModel,resetWeaponNoticeModel,updateWeaponNoticeModel} from "../components/three/ufo/weapon-notice-model.mjs";
import {serializeThreeAsset} from "./serialize-three-asset.mjs";
const font=new FontLoader().parse(JSON.parse(await readFile("public/fonts/sabo-filled.typeface.json","utf8")));
const folder=resolve("docs/references/weapon-notice"),temporary=join(tmpdir(),"portfolio-weapon-notice");
await mkdir(folder,{recursive:true});await mkdir(temporary,{recursive:true});
for(const [name,age] of [["formed",.5],["dispersing",1.5]]){
 const model=createWeaponNoticeModel(font,"CHARGED BOLTS",{fontSize:1});resetWeaponNoticeModel(model);updateWeaponNoticeModel(model,age);
 const asset={...serializeThreeAsset(model.root),frame:{center:[0,0,0],span:11.5},view:[.05,.05,10],width:1100,height:340};
 const file=join(temporary,`${name}.json`);await writeFile(file,JSON.stringify(asset));
 const result=spawnSync(process.env.BLENDER_EXECUTABLE??"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe",["--background","--factory-startup","--python-exit-code","1","--python",resolve("scripts/render-hud-icons.py"),"--",file,join(folder,`${name}.png`)],{stdio:"inherit",windowsHide:true});
 if(result.error)throw result.error;if(result.status)process.exit(result.status);model.dispose();
}
