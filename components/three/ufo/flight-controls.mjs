/** Keyboard mapping shared by both scenes. Equivalent keys never multiply input. */
export const PRECISION_AIM_SCALE=.25;
export function getFlightInput(keys,active=true){
 const held=code=>Number(keys.has(code));
 if(!active)return {turn:0,pitch:0,thrust:0,strafe:0,roll:0,lift:0,brake:true};
 const brake=keys.has("ShiftLeft")||keys.has("ShiftRight"),arrowScale=brake?PRECISION_AIM_SCALE:1;
 const turn=Math.max(held("KeyD"),held("ArrowRight"))-Math.max(held("KeyA"),held("ArrowLeft"));
 return {turn:turn*(keys.has("KeyA")||keys.has("KeyD")?1:arrowScale),pitch:(held("ArrowUp")-held("ArrowDown"))*arrowScale,thrust:held("KeyW")-held("KeyS"),strafe:0,roll:held("KeyQ")-held("KeyE"),lift:held("Space")-held("KeyC"),brake};
}
