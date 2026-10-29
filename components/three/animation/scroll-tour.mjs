import {CatmullRomCurve3,Vector3} from "three";
export const clampTour=value=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
/** Paired centripetal splines: position and aim change together through the scene. */
export function createScrollTour(){
 const path=new CatmullRomCurve3([[0,0,22],[14,5,14],[23,8,-6],[4,6,-33],[-23,3,-14],[-14,-4,10],[0,8,26]].map(p=>new Vector3(...p)),false,"centripetal");
 const aim=new CatmullRomCurve3([[0,.35,-9],[0,1,-9],[0,2,-9],[0,1,-9],[0,.35,-9],[0,0,-9],[0,.35,-9]].map(p=>new Vector3(...p)),false,"centripetal");
 return {sample(progress){const t=clampTour(progress);return {position:path.getPointAt(t),target:aim.getPointAt(t)};}};
}
export function wheelTourProgress(current,delta,mode=0,height=800){
 const pixels=delta*(mode===1?16:mode===2?height:1);
 return clampTour(current+Math.max(-400,Math.min(400,pixels))/5000);
}
