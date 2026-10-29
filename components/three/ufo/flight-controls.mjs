/** Keyboard mapping shared by both scenes. Equivalent keys never multiply input. */
export function getFlightInput(keys,active=true){
 const held=code=>Number(keys.has(code));
 if(!active)return {turn:0,pitch:0,thrust:0,strafe:0,lift:0,brake:true};
 return {turn:Math.max(held("KeyD"),held("ArrowRight"))-Math.max(held("KeyA"),held("ArrowLeft")),pitch:held("ArrowUp")-held("ArrowDown"),thrust:held("KeyW")-held("KeyS"),strafe:held("KeyE")-held("KeyQ"),lift:held("Space")-held("KeyC"),brake:keys.has("ShiftLeft")||keys.has("ShiftRight")};
}
