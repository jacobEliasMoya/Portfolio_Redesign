export const LAUNCH_DURATION=2.6;
const ease=x=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
export function launchProgress(age,reducedMotion=false){
 if(reducedMotion)return {lift:2.5,gear:0,done:true};
 return {lift:2.5*ease(age/LAUNCH_DURATION),gear:1-ease((age-.85)/1.1),done:age>=LAUNCH_DURATION};
}

export function markCameraReady(signal,value){if(signal)signal.current=value;}

export const HANDOFF_DURATION=1.2;
export function blendLaunchAttitude(start,target,age,out,reducedMotion=false){return out.copy(start).slerp(target,reducedMotion?1:ease(age/HANDOFF_DURATION));}
