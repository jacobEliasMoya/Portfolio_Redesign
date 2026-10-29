import {Vector3} from "three";
export const LANDING_RANGE=5,LANDING_DURATION=4.2;
const offset=new Vector3();
export const landingEase=x=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
export function canLand(position,pad,normal){offset.copy(position).sub(pad);const distance=offset.length();return distance>.05&&distance<=LANDING_RANGE&&offset.dot(normal)/distance>=Math.cos(Math.PI/4);}
export function landingPose(start,pad,normal,clearance,age,out){
 const approach=landingEase(age/1.9),descent=landingEase((age-1.9)/2.3);
 offset.copy(pad).addScaledVector(normal,clearance+2.5*(1-descent));
 out.copy(start).lerp(offset,approach);return {gear:landingEase((age-.5)/1.8),power:1-descent,done:age>=LANDING_DURATION};
}
