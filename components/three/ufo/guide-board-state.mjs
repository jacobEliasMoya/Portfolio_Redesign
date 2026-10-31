export const GUIDE_BUILD_SECONDS=2.1,GUIDE_DISMISS_SECONDS=.8;
/** Animation data is mutable; React only hears about phase/layout changes. */
export function createGuideBoardState(){
 let phase="closed",target=0,layout={x:0,y:0,width:880,height:520};
 const frame={progress:0},listeners=new Set(),frames=new Set();
 const setPhase=value=>{if(value===phase)return;phase=value;listeners.forEach(callback=>callback());};
 return {
  getSnapshot:()=>phase,getFrame:()=>frame,getLayout:()=>layout,
  subscribe(callback){listeners.add(callback);return()=>{listeners.delete(callback);};},
  subscribeFrame(callback){frames.add(callback);return()=>{frames.delete(callback);};},
  setLayout(next){if(Object.keys(layout).every(key=>layout[key]===next[key]))return;layout=next;listeners.forEach(callback=>callback());frames.forEach(callback=>callback());},
  open(reducedMotion=false){target=1;frame.progress=reducedMotion?1:0;setPhase(reducedMotion?"open":"opening");frames.forEach(callback=>callback());},
  close(reducedMotion=false){target=0;if(reducedMotion)frame.progress=0;setPhase(reducedMotion?"closed":"closing");frames.forEach(callback=>callback());},
  tick(delta,reducedMotion=false){
   const dt=Math.max(0,Math.min(.05,delta));
   frame.progress=reducedMotion?target:Math.max(0,Math.min(1,frame.progress+(target?1:-1)*dt/(target?GUIDE_BUILD_SECONDS:GUIDE_DISMISS_SECONDS)));
   if(frame.progress===target)setPhase(target?"open":"closed");frames.forEach(callback=>callback());
  },
 };
}
