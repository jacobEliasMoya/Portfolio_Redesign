import {weaponForKey} from "./weapon-selection.mjs";
const HUD_FIELDS=["mode","charge","canLand","tourIndex","weapon"];
/** Per-scene store: notify React only on discrete HUD changes, never every render frame. */
export function createHudState(){
 let snapshot={mode:"docked",charge:0,canLand:false,tourIndex:0,weapon:"bolts"};const listeners=new Set(),weaponRequests=new Set();
 return {getSnapshot:()=>snapshot,subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
 subscribeWeaponRequest(listener){weaponRequests.add(listener);return()=>{weaponRequests.delete(listener);};},
 requestWeapon(code){if(!weaponForKey(code))return false;for(const listener of weaponRequests)listener(code);return weaponRequests.size>0;},
 publish(patch){let changed=false;for(const key of HUD_FIELDS)if(key in patch&&snapshot[key]!==patch[key]){changed=true;break;}if(!changed)return;snapshot={...snapshot,...patch};for(const listener of listeners)listener();}};
}
/** One character per tick; erase the previous word fully before typing the new one. */
export function stepActionText(state,target){
 if(state.target!==target)return {text:state.text,target,erasing:state.text.length>0};
 if(state.erasing)return {text:state.text.slice(0,-1),target,erasing:state.text.length>1};
 return {text:target.slice(0,state.text.length+1),target,erasing:false};
}
export function actionForMode(mode){return mode==="flying"||mode==="launching"||mode==="landing"?"LAND":"LAUNCH";}
