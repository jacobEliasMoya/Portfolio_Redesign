export const CHARGE_SECONDS=1.5;
export function chargeLevel(start,now){return Math.max(0,Math.min(1,(now-start)/1000/CHARGE_SECONDS));}
// One shared charge: overlapping keyboard/mouse holds release only once.
export function createWeaponCharge(){
 const held=new Set();let start=0;
 return {begin(source,now){if(!held.size)start=now;held.add(source);},
 release(source,now){if(!held.delete(source)||held.size)return null;return chargeLevel(start,now);},
 level(now){return held.size?chargeLevel(start,now):0;},
 get active(){return held.size>0;},cancel(){held.clear();}};
}

export const isFullCharge=power=>Number.isFinite(power)&&power>=1;
/** Two gentle plasma breaths per second; reduced motion holds a steady envelope. */
export function plasmaPulse(age,reducedMotion=false){return reducedMotion?1:1+.12*Math.sin(Math.max(0,age)*Math.PI*4);}
export function chargedDamage(power){const p=Math.max(0,Math.min(1,Number.isFinite(power)?power:0));return isFullCharge(p)?20:1+Math.floor(7*p);}
