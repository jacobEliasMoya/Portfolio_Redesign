"use client";
import {BlackHole} from "./black-hole";
import {LensingField} from "./lensing-field";
export function BlackHoleV2({reducedMotion=false,paused=false,lensing=true}:{reducedMotion?:boolean;paused?:boolean;lensing?:boolean}){
 return <><BlackHole wideDisc reducedMotion={reducedMotion} paused={paused}/>{lensing&&<LensingField/>}</>;
}
