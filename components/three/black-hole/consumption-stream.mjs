/** Seed once on the CPU: replay stays deterministic and no random work runs per frame. */
export function streamSeeds(index){
 const hash=n=>{let x=(index+1)^n;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return ((x^(x>>>16))>>>0)/4294967295;};
 return [hash(0x137),hash(0x873),hash(0x425)];
}
export function sampleConsumptionStream(center,age,seed){
 const p=Math.max(0,Math.min(1,Math.max(0,age)*(1+seed[0]*.7)/3.4)),pull=(1-Math.exp(-2.2*p))/(1-Math.exp(-2.2)),start=Math.hypot(...center),radius=start+(1.65-start)*pull,envelope=Math.sin(Math.PI*p),gather=1-Math.exp(-Math.max(0,age)*4);
 const theta=Math.atan2(center[2],center[0])*Math.exp(-Math.max(0,age)*3)+(start-radius)*.8+(seed[1]-.5)*.06*envelope;
 const plane=-.2*Math.cos(theta)*radius-.1*Math.sin(theta)*radius,y=center[1]*(1-gather)+plane*gather+(seed[2]-.5)*.22*envelope,horizontal=Math.sqrt(Math.max(0,radius*radius-y*y));
 return [Math.cos(theta)*horizontal,y,Math.sin(theta)*horizontal];
}
export const streamDeclarations=`attribute vec3 aStreamSeed;`;
export const streamMotion=`
float streamP=clamp(consumeAge*(1.0+aStreamSeed.x*.7)/3.4,0.0,1.0);
float streamPull=(1.0-exp(-2.2*streamP))/(1.0-exp(-2.2));
float streamStart=length(releaseCenter);
float streamRadius=mix(streamStart,1.65,streamPull);
float streamEnvelope=sin(3.14159265359*streamP);
float streamTheta=atan(releaseCenter.z,releaseCenter.x)*exp(-consumeAge*3.0)+(streamStart-streamRadius)*.8+(aStreamSeed.y-.5)*.06*streamEnvelope;
float streamGather=1.0-exp(-consumeAge*4.0);
float streamPlane=-.2*cos(streamTheta)*streamRadius-.1*sin(streamTheta)*streamRadius;
float streamY=mix(releaseCenter.y,streamPlane,streamGather)+(aStreamSeed.z-.5)*.22*streamEnvelope;
float streamHorizontal=sqrt(max(0.0,streamRadius*streamRadius-streamY*streamY));
vec3 streamCenter=vec3(cos(streamTheta)*streamHorizontal,streamY,sin(streamTheta)*streamHorizontal);
// Separate tumble from the common curved stream, so neighboring tiles stop moving as a sheet.
vec3 spinAxis=normalize(aStreamSeed*2.0-1.0+vec3(.001));
float spinAngle=consumeAge*(2.0+aStreamSeed.z*6.0),sc=cos(spinAngle),ss=sin(spinAngle),st=1.0-sc;
mat3 streamSpin=mat3(
 st*spinAxis.x*spinAxis.x+sc,st*spinAxis.x*spinAxis.y+ss*spinAxis.z,st*spinAxis.x*spinAxis.z-ss*spinAxis.y,
 st*spinAxis.x*spinAxis.y-ss*spinAxis.z,st*spinAxis.y*spinAxis.y+sc,st*spinAxis.y*spinAxis.z+ss*spinAxis.x,
 st*spinAxis.x*spinAxis.z+ss*spinAxis.y,st*spinAxis.y*spinAxis.z-ss*spinAxis.x,st*spinAxis.z*spinAxis.z+sc);
float streamShrink=max(.0001,(1.0-.42*(1.0-exp(-consumeAge*5.0)))*(1.0-smoothstep(.74,1.0,streamP)));
`;
