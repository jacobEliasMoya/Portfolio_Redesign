/** Seeded world-space shell distribution; no stars inside the planet/flight area. */
export function buildStarfield(seed=4729){
 let state=seed>>>0;const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
 const points=[],accents=[];
 function star(inner,outer,size){
  const y=random()*2-1,angle=random()*Math.PI*2,radius=Math.cbrt(inner**3+random()*(outer**3-inner**3)),ring=Math.sqrt(1-y*y);
  const warmth=random(),brightness=.65+random()*.35;
  const color=warmth<.15?[brightness,brightness*.87,brightness*.72]:[brightness*.83,brightness*.91,brightness];
  return {position:[Math.cos(angle)*ring*radius,y*radius+.35,Math.sin(angle)*ring*radius-9],size:size*(.65+random()*.7),color};
 }
 for(let i=0;i<1400;i++)points.push(star(140,280,.18));
 for(let i=0;i<180;i++)points.push(star(55,110,.08));
 for(let i=0;i<28;i++)accents.push(star(110,210,.14));
 return {points,accents};
}
