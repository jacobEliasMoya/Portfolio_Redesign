/** Keep touch steering and firing independent; release/cancel must also cancel queued fire. */
export function createArcadeInput(send,schedule,cancel){
 let stick=new Set(),held=new Set(),firing=false,pending=null;
 const sync=()=>{const next=new Set(stick);if(firing)next.add('KeyF');for(const key of held)if(!next.has(key))send(key,false);for(const key of next)if(!held.has(key))send(key,true);held=next;};
 const releaseFire=()=>{if(pending!==null)cancel(pending);pending=null;firing=false;sync();};
 return {
  steer(keys){stick=new Set(keys);sync();},
  releaseStick(){stick.clear();sync();},
  queueFire(){releaseFire();pending=schedule(()=>{pending=null;firing=true;sync();});},
  releaseFire,
  clear(){if(pending!==null)cancel(pending);pending=null;firing=false;stick.clear();sync();},
 };
}
