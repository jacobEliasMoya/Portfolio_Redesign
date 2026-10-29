"use client";
import {BlackHole} from "./black-hole";
import {LensingField} from "./lensing-field";
export function BlackHoleV2({reducedMotion=false,paused=false,lensing=true,gravity=true,gravityPower=1}:{reducedMotion?:boolean;paused?:boolean;lensing?:boolean;gravity?:boolean;gravityPower?:number}){
 return <><BlackHole wideDisc reducedMotion={reducedMotion} paused={paused} gravity={gravity} gravityPower={gravityPower}/>{lensing&&<LensingField/>}</>;
}
