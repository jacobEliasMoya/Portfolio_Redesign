import {BufferGeometry,Float32BufferAttribute,ExtrudeGeometry,Shape} from "three";
import {JM_OUTLINES} from "./jm-flag-outlines.mjs";
export const FLAG_WIDTH=.42,FLAG_HEIGHT=.26;
export function flagFold(x,y){return Math.sin(x*22+y*9)*.014*(.2+.8*x/FLAG_WIDTH)+Math.sin(x*45-y*11)*.006;}
export function createLunarFlagGeometry(){
 const positions=[],colors=[],cyan=[];
 function point(x,y,out){out.push(x,y,flagFold(x,y));}
 for(let row=0;row<6;row++)for(let col=0;col<12;col++){
  const x=col*FLAG_WIDTH/12,y=.36+row*FLAG_HEIGHT/6,dx=FLAG_WIDTH/12,dy=FLAG_HEIGHT/6;
  for(const tri of [[[x,y],[x+dx,y],[x,y+dy]],[[x+dx,y],[x+dx,y+dy],[x,y+dy]]]){
   const shade=.85+((row*7+col*11)%5)*.04;
   for(const [a,b] of tri){point(a,b,positions);colors.push(.018*shade,.042*shade,.16*shade);}
  }
 }
 const cloth=new BufferGeometry();cloth.setAttribute("position",new Float32BufferAttribute(positions,3));cloth.setAttribute("color",new Float32BufferAttribute(colors,3));cloth.computeVertexNormals();
 for(let row=0;row<6;row++){const y=.36+row*FLAG_HEIGHT/6,dy=FLAG_HEIGHT/6;for(const [x,b] of [[0,y],[.023,y],[0,y+dy],[.023,y],[.023,y+dy],[0,y+dy]])cyan.push(x,b,flagFold(x,b)+.0015);}
 const stripe=new BufferGeometry();stripe.setAttribute("position",new Float32BufferAttribute(cyan,3));stripe.computeVertexNormals();
 const shapes=JM_OUTLINES.map(points=>{const s=new Shape();points.forEach(([x,y],i)=>i?s.lineTo(x+.225,y+.488):s.moveTo(x+.225,y+.488));s.closePath();return s;});
 const letters=new ExtrudeGeometry(shapes,{depth:.003,bevelEnabled:false,steps:1,curveSegments:1}),p=letters.getAttribute("position");
 for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+flagFold(p.getX(i),p.getY(i))+.003);letters.computeVertexNormals();
 return {cloth,stripe,letters};
}

/** Temporary launch wash, anchored at the pole and strongest at the free edge. */
export function flagLaunchWash(x,y,time,strength){if(x<=0||strength<=0)return 0;return Math.pow(Math.max(0,x/FLAG_WIDTH),1.25)*strength*(Math.sin(x*24+y*11-time*15)*.019+Math.sin(x*39-time*21)*.006);}

/** A bounded pointer-local fabric push; the pole and printed layers stay aligned. */
export function flagHoverWash(x,y,time,pointerX,pointerY,strength){
 if(x<=0||strength<=0)return 0;
 const distance=Math.hypot(x-pointerX,y-pointerY),anchor=Math.min(1,x/FLAG_WIDTH);
 return .018*Math.min(1,strength)*anchor*Math.exp(-distance*distance/.025)*(.7+.3*Math.sin(time*7-distance*20));
}
