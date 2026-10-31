export const HUD_FLIP_OUT_MS=180,HUD_FLIP_IN_MS=260;
const ease=t=>{const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10);};
export function hudFlipPose(now,enteredAt,departedAt,reducedMotion=false){
 if(reducedMotion)return {angle:0,visible:departedAt===undefined,active:false};
 const enter=time=>-Math.PI/2*(1-ease((time-enteredAt-HUD_FLIP_OUT_MS)/HUD_FLIP_IN_MS))||0;
 if(departedAt!==undefined){
  const t=(now-departedAt)/HUD_FLIP_OUT_MS,start=enter(departedAt);
  return {angle:start+(Math.PI/2-start)*ease(t),visible:departedAt>=enteredAt+HUD_FLIP_OUT_MS&&t<1,active:t<1};
 }
 return {angle:enter(now),visible:now>=enteredAt+HUD_FLIP_OUT_MS,active:now<enteredAt+HUD_FLIP_OUT_MS+HUD_FLIP_IN_MS};
}
export function applyHudFlip(root,now,enteredAt,departedAt,reducedMotion,pivotY=root.position.y){
 const pose=hudFlipPose(now,enteredAt,departedAt,reducedMotion);
 const offset=root.position.y-pivotY;
 root.position.y=pivotY+offset*Math.cos(pose.angle);root.position.z=offset*Math.sin(pose.angle);
 root.rotation.x=pose.angle;root.visible=pose.visible;return pose.active;
}
