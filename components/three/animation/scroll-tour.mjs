import {Quaternion,Vector3} from "three";
export const clampTour=value=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
// Add text/place anchor keys here to extend the tour; progress is distributed automatically.
export const TOUR_STOPS=Object.freeze([
 {key:"overview",label:"Overview"},{key:"jake",label:"Jake"},{key:"space",label:"Space"},{key:"california",label:"California"},{key:"moon",label:"Moon"}
].map((stop,index,stops)=>Object.freeze({...stop,progress:index/(stops.length-1)})));
export function stepTourStops(current,steps){let value=clampTour(current);for(let i=0;i<Math.min(TOUR_STOPS.length,Math.abs(steps));i++)value=steps>0?(TOUR_STOPS.find(stop=>stop.progress>value+.001)?.progress??1):([...TOUR_STOPS].reverse().find(stop=>stop.progress<value-.001)?.progress??0);return value;}
export function createTourAnchors(){return {earthCenter:new Vector3(0,.35,-9),overview:new Vector3(0,.35,-9),earthRadius:6.5,moonRadius:6.5*.273,jake:new Vector3(-3,.35,1),space:new Vector3(4,.35,0),california:new Vector3(-4,4,-11),moon:new Vector3(0,.35-(6.5*3.6+6.5*.273)*Math.sin(Math.PI/10),-9+(6.5*3.6+6.5*.273)*Math.cos(Math.PI/10))};}
const ease=t=>t*t*t*(t*(t*6-15)+10);
/** Ordered live text/place landmarks; spherical travel avoids cutting through Earth between views. */
export function createScrollTour(){
 const defaults=createTourAnchors(),positions=Array.from({length:TOUR_STOPS.length},()=>new Vector3()),targets=Array.from({length:TOUR_STOPS.length},()=>new Vector3()),direction=new Vector3(),start=new Vector3(),end=new Vector3(),turn=new Quaternion(),rotation=new Quaternion(),result={position:new Vector3(),target:new Vector3()};
 return {sample(progress,anchors=defaults){
  const center=anchors.earthCenter,radius=Math.max(.1,anchors.earthRadius),viewDistance=Math.max(22,radius*3.8);
  for(let index=0;index<TOUR_STOPS.length;index++){
   const key=TOUR_STOPS[index].key,point=anchors[key];
   targets[index].copy(point);
   if(key==="overview"){direction.copy(anchors.moon).sub(center).normalize();positions[index].copy(anchors.moon).addScaledVector(direction,Math.max(9,anchors.moonRadius*5));positions[index].y+=anchors.moonRadius*2;continue;}
   direction.copy(point).sub(center).normalize();
   positions[index].copy(point).addScaledVector(direction,viewDistance);
   if(key==="moon")positions[index].y+=anchors.moonRadius*1.8;
   if(key==="california")positions[index].y+=radius*.08;
  }
  const scaled=clampTour(progress)*(TOUR_STOPS.length-1),segment=Math.min(TOUR_STOPS.length-2,Math.floor(scaled)),t=ease(scaled-segment);
  start.copy(positions[segment]).sub(center);end.copy(positions[segment+1]).sub(center);const distance=start.length()+(end.length()-start.length())*t;
  start.normalize();end.normalize();turn.setFromUnitVectors(start,end);rotation.identity().slerp(turn,t);
  result.position.copy(start).applyQuaternion(rotation).multiplyScalar(distance).add(center);result.position.y+=Math.sin(Math.PI*t)*radius*.25;
  result.target.lerpVectors(targets[segment],targets[segment+1],t);
  keepTourCameraClearance(result.position,anchors);return result;
 }};
}
const clearanceScratch=new WeakMap();
export function keepTourCameraClearance(position,anchors){let offset=clearanceScratch.get(position);if(!offset){offset=new Vector3();clearanceScratch.set(position,offset);}
 for(const [center,radius] of [[anchors.earthCenter,anchors.earthRadius*1.3],[anchors.moon,anchors.moonRadius*1.5]]){offset.copy(position).sub(center);if(offset.lengthSq()<radius*radius){if(offset.lengthSq()<1e-9)offset.set(0,0,1);position.copy(center).addScaledVector(offset.normalize(),radius);}}
 return position;
}
export function wheelTourProgress(current,delta,mode=0,height=800){
 const pixels=delta*(mode===1?16:mode===2?height:1);
 return clampTour(current+Math.max(-400,Math.min(400,pixels))/5000);
}
