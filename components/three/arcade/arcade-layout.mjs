/** Pixel-space layout shared by the mesh frame, world viewport and native controls. */
export function arcadeLayout(width,height){
 const rail=Math.max(10,Math.min(32,width*.035)),header=Math.max(48,Math.min(82,width*.085)),deck=Math.max(96,Math.min(120,height*.155));
 const screen={x:rail+10,y:header+30,width:width-2*(rail+10),height:height-header-deck-54};
 const cy=height-deck*.52-12;
 return {width,height,rail,header,deck,screen,joystick:{x:width*.22,y:cy},start:{x:width*.46,y:cy+8},buttons:[.64,.76,.88].map(x=>({x:width*x,y:cy+8})),buttonRadius:Math.max(11,Math.min(23,width*.025))};
}
/** Drag directions; vertical drives thrust and horizontal steers, including diagonals. */
export function joystickKeys(x,y,deadZone=8){return [x < -deadZone?'KeyA':x>deadZone?'KeyD':null,y < -deadZone?'KeyW':y>deadZone?'KeyS':null].filter(value=>value!==null);}
