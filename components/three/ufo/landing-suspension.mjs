export const GEAR_FOOT_DEPTH=1.1275,PARKED_COMPRESSION=.035,TOUCHDOWN_SETTLE=.85;
const ease=x=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
/** Analytic damped response: independent of frame rate and bounded in model units. */
export function touchdownCompression(age,reducedMotion=false){
 if(reducedMotion||age>=TOUCHDOWN_SETTLE)return PARKED_COMPRESSION;
 if(age<=0)return 0;
 const decay=6,frequency=12,velocity=1.4;
 const spring=PARKED_COMPRESSION+Math.exp(-decay*age)*(-PARKED_COMPRESSION*Math.cos(frequency*age)+(velocity-decay*PARKED_COMPRESSION)/frequency*Math.sin(frequency*age));
 return Math.max(0,spring+(PARKED_COMPRESSION-spring)*ease((age-.65)/.2));
}
/** Load briefly into the struts, then unload before the feet leave the pad. */
export function launchCompression(age,reducedMotion=false){
 if(reducedMotion||age>=.35)return 0;
 if(age<=.13)return PARKED_COMPRESSION+(.085-PARKED_COMPRESSION)*ease(age/.13);
 return .085*(1-ease((age-.13)/.22));
}
/** Compression shortens legs by the same distance the body lowers, anchoring the feet. */
export function applyLandingGear(group,deployment,compression=0){
 if(!group)return;const amount=Math.max(0,Math.min(1,deployment)),load=Math.max(0,Math.min(.12,compression));
 // Collapse toward the underside mounting plane, never translate shortened legs above the hull.
 group.visible=amount>.01;group.position.y=-(1-amount)*.40;group.scale.y=amount*(1-load/GEAR_FOOT_DEPTH);
}
