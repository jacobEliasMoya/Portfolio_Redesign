/** @typedef {"bolts"|"death-ray"} WeaponId */
/** @typedef {{weapon:WeaponId,power:number}} WeaponShot */
/** @type {ReadonlyArray<Readonly<{number:number,id:WeaponId|null,label:string}>>} */
export const WEAPON_SLOTS=Object.freeze([
 Object.freeze({number:1,id:"bolts",label:"CHARGED BOLTS"}),
 Object.freeze({number:2,id:"death-ray",label:"RED DEATH RAY"}),
 Object.freeze({number:3,id:null,label:"RESERVED"}),
]);
export function weaponForKey(code){
 if(code==="Digit1"||code==="Numpad1")return "bolts";
 if(code==="Digit2"||code==="Numpad2")return "death-ray";
 return null;
}
export function createWeaponSelection(){
 /** @type {WeaponId} */ let selected="bolts";
 const heldRay=new Set();
 return {get selected(){return selected;},get rayHeld(){return selected==="death-ray"&&heldRay.size>0;},
  select(code,charge,shots){const next=weaponForKey(code);if(!next||next===selected)return false;selected=next;heldRay.clear();charge.cancel();shots.length=0;return true;},
  begin(source,now,charge){if(selected==="death-ray")heldRay.add(source);else charge.begin(source,now);},
  /** Bolts snapshot at release; a ray simply follows the held input. @returns {WeaponShot|null} */
  release(source,now,charge){heldRay.delete(source);const power=charge.release(source,now);return power===null?null:{weapon:"bolts",power};},
  cancel(charge){heldRay.clear();charge.cancel();},
 };
}
