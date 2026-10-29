import {IcosahedronGeometry,Vector3} from "three";

export const BLACK_HOLE_RADIUS=2;
const hash=n=>{const f=Math.sin(n*127.13+43.7)*43758.5453;return f-Math.floor(f);};
/** Dual geodesic mesh: adjoining hex faces, with twelve necessary pentagonal junctions. */
export function createShellPanels(){
 const source=new IcosahedronGeometry(1,11),p=source.attributes.position,vertices=[],lookup=new Map();
 for(let i=0;i<p.count;i+=3){const ids=[];for(let j=0;j<3;j++){const v=new Vector3().fromBufferAttribute(p,i+j).normalize(),key=v.toArray().map(x=>x.toFixed(6)).join(",");if(!lookup.has(key)){lookup.set(key,vertices.length);vertices.push({normal:v,points:[]});}ids.push(lookup.get(key));}const c=ids.reduce((s,id)=>s.add(vertices[id].normal),new Vector3()).normalize();for(const id of ids)vertices[id].points.push(c);}
 const panels=vertices.map(({normal,points},index)=>{
  const right=new Vector3().crossVectors(normal,Math.abs(normal.y)<.9?new Vector3(0,1,0):new Vector3(1,0,0)).normalize(),up=new Vector3().crossVectors(normal,right);
  points.sort((a,b)=>Math.atan2(a.dot(up),a.dot(right))-Math.atan2(b.dot(up),b.dot(right)));
  return {normal:normal.toArray(),right:right.toArray(),up:up.toArray(),points:points.map(v=>[v.dot(right)/v.dot(normal)*2,v.dot(up)/v.dot(normal)*2]),relief:.012+hash(index)*.024,shade:index%3};
 });source.dispose();return panels;
}
/** Differential orbit: inner rings are fast; outer debris retains a readable slower flow. */
export function blackHoleOrbitSpeed(radius){return 1.8*Math.pow(2.15/Math.max(2.15,radius),2.2);}
export function createAccretionBands({wide=false}={}){
 const bands=[];
 for(let band=0;band<(wide?7:5);band++){
  const center=2.22+band*(wide?.53:.34),tiles=[];
  for(let i=0;i<(wide?1400:900);i++){
   const seed=band*997+i,angle=hash(seed)*Math.PI*2,stream=Math.sin(angle*3-band*.95);
   if(stream<-.35&&hash(seed+2001)<.72)continue;
   const radius=center+(hash(seed+301)-.5)*(wide?(.30+.10*(stream+1)):(.13+.06*(stream+1)))+.09*Math.sin(angle*3-band*.75),size=.060+hash(seed+607)*.035;
   tiles.push({angle,radius,y:(hash(seed+901)-.5)*(.065+band*.018)+.025*Math.sin(angle*6+band),size,depth:.025+hash(seed+709)*.025,tilt:(hash(seed+202)-.5)*.24,shade:.66+hash(seed+303)*.34});
  }
  bands.push({radius:center,speed:blackHoleOrbitSpeed(center),tiles});
 }
 const loose=Array.from({length:80},(_,i)=>({angle:hash(i+5031)*Math.PI*2,radius:(wide?5.7:3.65)+hash(i+8301)*(wide?.65:.55),y:(hash(i+9081)-.5)*.36,size:.055+hash(i+7201)*.075,depth:.035+hash(i+3027)*.055,tilt:(hash(i+2004)-.5)*.7,shade:.6+hash(i+409)*.4}));
 return {bands,loose};
}
