/** Stylized compressed orbit, independent of Earth's drag and axial spin. */
export const MOON_ORBIT = Object.freeze({ period: 100, initialPhase: 0, inclination: 18 * Math.PI / 180, node: -12 * Math.PI / 180 });
export function getMoonOrbitPose(seconds, distance, period = MOON_ORBIT.period) {
  const phase = MOON_ORBIT.initialPhase + Math.max(0,seconds) / period * Math.PI * 2;
  return { position: [Math.sin(phase)*distance,0,Math.cos(phase)*distance], yaw: phase + Math.PI };
}

/** Preserve tangent velocity at release; no acceleration or artificial drag afterward. */
export function releaseMoon(seconds,distance){
 const phase=MOON_ORBIT.initialPhase+Math.max(0,seconds)/MOON_ORBIT.period*Math.PI*2,omega=Math.PI*2/MOON_ORBIT.period;
 const pose=getMoonOrbitPose(seconds,distance);
 return {position:[...pose.position],velocity:[Math.cos(phase)*distance*omega,0,-Math.sin(phase)*distance*omega],rotation:[0,pose.yaw,0]};
}
export function advanceFreeMoon(motion,delta){
 const dt=Math.max(0,Math.min(.1,delta));
 for(let i=0;i<3;i++)motion.position[i]+=motion.velocity[i]*dt;
 motion.rotation[0]+=.18*dt;motion.rotation[1]+=.27*dt;motion.rotation[2]+=.13*dt;
 return motion;
}
