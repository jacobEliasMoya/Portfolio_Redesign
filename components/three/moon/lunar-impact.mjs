/** Darken the continuous lunar survey skin under removed tiles, keeping it sealed. */
export function scorchLunarSkin(geometry,mark){
 const position=geometry.getAttribute("position"),color=geometry.getAttribute("color"),radius=mark.radius*1.4;
 let affected=0;
 for(let i=0;i<position.count;i++){
  const distance=Math.hypot(position.getX(i)-mark.x,position.getY(i)-mark.y,position.getZ(i)-mark.z);
  if(distance>=radius)continue;
  const darkness=.2+.45*Math.pow(distance/radius,2);
  color.setXYZ(i,color.getX(i)*darkness,color.getY(i)*darkness,color.getZ(i)*darkness);affected++;
 }
 if(affected)color.needsUpdate=true;
 return affected;
}
