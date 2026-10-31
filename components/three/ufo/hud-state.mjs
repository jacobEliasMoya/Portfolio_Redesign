import {weaponForKey} from "./weapon-selection.mjs";
const HUD_FIELDS=["mode","charge","canLand","tourIndex","weapon","score","singularityUsed","singularityPhase","singularityShipConsumed","singularityShipCaptured","rocketNotice"];
export const canRemoteDetonate=state=>state.singularityUsed&&!state.singularityShipCaptured&&["flight","armed"].includes(state.singularityPhase);
export const formatScore=score=>String(Math.max(0,Math.floor(score))).padStart(5,"0");
/** Per-scene store: notify React only on discrete HUD changes, never every render frame. */
export function createHudState(){
 let snapshot={mode:"docked",charge:0,canLand:false,tourIndex:0,weapon:"bolts",score:0,singularityUsed:false,singularityPhase:"idle",singularityShipConsumed:false,singularityShipCaptured:false,rocketNotice:/** @type {{id:number,text:string,color:string}|null} */(null)};let noticeSerial=0;const listeners=new Set(),weaponRequests=new Set(),singularityRequests=new Set();
 const detonate=()=>{if(!canRemoteDetonate(snapshot))return false;snapshot={...snapshot,singularityPhase:"detonating"};for(const listener of listeners)listener();for(const listener of singularityRequests)listener(null);return true;};
 return {detonateSingularity:detonate,getSnapshot:()=>snapshot,subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
 announceRocket(text,color="#e9eee5"){snapshot={...snapshot,rocketNotice:{id:++noticeSerial,text,color}};for(const listener of listeners)listener();},
 clearRocketNotice(id){if(snapshot.rocketNotice?.id!==id)return;snapshot={...snapshot,rocketNotice:null};for(const listener of listeners)listener();},
 addDamage(damage){if(!Number.isFinite(damage)||damage<=0)return;snapshot={...snapshot,score:Math.min(Number.MAX_SAFE_INTEGER,snapshot.score+Math.round(damage*100))};for(const listener of listeners)listener();},
 subscribeSingularity(listener){singularityRequests.add(listener);return()=>singularityRequests.delete(listener);},
 /** @param {ReturnType<import("../black-hole/atom-projectile.mjs").createAtomLaunch>} [shot] */
 fireSingularity(shot=null){if(snapshot.singularityUsed)return snapshot.weapon==="singularity"?detonate():false;if(!shot||snapshot.score<=6767||snapshot.singularityUsed||snapshot.weapon!=="singularity"||snapshot.mode!=="flying")return false;snapshot={...snapshot,singularityUsed:true,singularityPhase:"flight"};for(const listener of listeners)listener();for(const listener of singularityRequests)listener(shot);return true;},
 subscribeWeaponRequest(listener){weaponRequests.add(listener);return()=>{weaponRequests.delete(listener);};},
 requestWeapon(code){if(!weaponForKey(code)||(weaponForKey(code)==="singularity"&&(snapshot.score<=6767||(snapshot.singularityUsed&&!canRemoteDetonate(snapshot)))))return false;for(const listener of weaponRequests)listener(code);return weaponRequests.size>0;},
 publish(patch){let changed=false;for(const key of HUD_FIELDS)if(key in patch&&snapshot[key]!==patch[key]){changed=true;break;}if(!changed)return;snapshot={...snapshot,...patch};for(const listener of listeners)listener();}};
}
/** One character per tick; erase the previous word fully before typing the new one. */
export function stepActionText(state,target){
 if(state.target!==target)return {text:state.text,target,erasing:state.text.length>0};
 if(state.erasing)return {text:state.text.slice(0,-1),target,erasing:state.text.length>1};
 return {text:target.slice(0,state.text.length+1),target,erasing:false};
}
export function actionForMode(mode){return mode==="flying"||mode==="launching"||mode==="landing"?"LAND":"LAUNCH";}
