import {Vector3} from "three";
import {touchdownCompression,TOUCHDOWN_SETTLE} from "./landing-suspension.mjs";
export const LANDING_RANGE=5,TOUCHDOWN_TIME=4.2,LANDING_DURATION=TOUCHDOWN_TIME+TOUCHDOWN_SETTLE;
const offset=new Vector3();
export const landingEase=x=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
export function canLand(position,pad,normal){offset.copy(position).sub(pad);const distance=offset.length();return distance>.05&&distance<=LANDING_RANGE&&offset.dot(normal)/distance>=Math.cos(Math.PI/4);}
export function landingPose(start,pad,normal,clearance,age,out,shipScale=1){
 const approach=landingEase(age/1.9),descent=landingEase((age-1.9)/2.3);
 const compression=age<TOUCHDOWN_TIME?0:touchdownCompression(age-TOUCHDOWN_TIME);
 offset.copy(pad).addScaledVector(normal,clearance+2.5*(1-descent)-compression*shipScale);
 out.copy(start).lerp(offset,approach);return {compression,gear:landingEase((age-.5)/1.8),power:1-descent,done:age>=LANDING_DURATION};
}
