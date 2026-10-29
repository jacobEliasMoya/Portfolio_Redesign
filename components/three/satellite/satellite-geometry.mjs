import {BufferGeometry,Float32BufferAttribute,Vector3} from "three";
import {mergeVertices} from "three/addons/utils/BufferGeometryUtils.js";

const TAU=Math.PI*2;
const xy=(radius,z,i)=>[Math.cos(i*TAU/6)*radius,Math.sin(i*TAU/6)*radius,z];
function builder(){
 const positions=[],normals=[],uvs=[],ab=new Vector3(),ac=new Vector3(),normal=new Vector3();
 function triangle(a,b,c){
  ab.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);ac.set(c[0]-a[0],c[1]-a[1],c[2]-a[2]);normal.crossVectors(ab,ac);
  if(normal.lengthSq()<1e-16)return;
  normal.normalize();for(const p of [a,b,c]){positions.push(...p);normals.push(normal.x,normal.y,normal.z);uvs.push(p[0],p[1]);}
 }
 return {triangle,quad(a,b,c,d){triangle(a,b,c);triangle(a,c,d);},finish(){const raw=new BufferGeometry();raw.setAttribute("position",new Float32BufferAttribute(positions,3));raw.setAttribute("normal",new Float32BufferAttribute(normals,3));raw.setAttribute("uv",new Float32BufferAttribute(uvs,2));const g=mergeVertices(raw,1e-6);raw.dispose();g.computeBoundingBox();g.computeBoundingSphere();return g;}};
}
function loft(profile,close=false){
 const b=builder();
 for(let row=0;row<(close?profile.length:profile.length-1);row++){
  const [r,z]=profile[row],[nextR,nextZ]=profile[(row+1)%profile.length];
  for(let i=0;i<6;i++)b.quad(xy(r,z,i),xy(nextR,nextZ,i),xy(nextR,nextZ,i+1),xy(r,z,i+1));
 }
 return b;
}
/** Flat-top six-sided shell, +Z face; shoulders taper to a smaller rear casing. */
export function createHexHousingGeometry(){
 const profile=[[1.27,.38],[1.35,.30],[1.35,-.62],[1.23,-.83],[1.15,-.9]],b=loft(profile);
 for(let i=0;i<6;i++){
  b.triangle([0,0,.38],xy(1.27,.38,i),xy(1.27,.38,i+1));
  b.triangle([0,0,-.9],xy(1.15,-.9,i+1),xy(1.15,-.9,i));
 }
 return b.finish();
}
/** Beveled frame with an actual open center. Depth includes the bevels. */
export function createHexRingGeometry(outerRadius=1.34,innerRadius=1.02,depth=.20){
 if(!(innerRadius>0&&outerRadius-innerRadius>.08&&depth>.05))throw new RangeError("Hex frame requires positive depth and a clear rim.");
 const half=depth/2,outerBevel=Math.min(.035,depth*.18),innerBevel=Math.min(.022,depth*.14);
 return loft([[outerRadius-outerBevel,half],[outerRadius,half-outerBevel],[outerRadius,-half+outerBevel],[outerRadius-outerBevel,-half],[innerRadius+innerBevel,-half],[innerRadius,-half+innerBevel],[innerRadius,half-innerBevel],[innerRadius+innerBevel,half]],true).finish();
}
/** Convex CRT face: exact hex boundary, gently rounded center, planar projected UVs. */
export function createScreenGeometry(radius=.99){
 const positions=[0,0,.035],uvs=[.5,.5],indices=[],rings=5,edgeSteps=6,segments=6*edgeSteps;
 for(let ring=1;ring<=rings;ring++){
  const f=ring/rings;
  for(let i=0;i<segments;i++){
   const edge=Math.floor(i/edgeSteps),t=(i%edgeSteps)/edgeSteps,a=xy(radius,0,edge),b=xy(radius,0,edge+1),x=(a[0]+(b[0]-a[0])*t)*f,y=(a[1]+(b[1]-a[1])*t)*f;
   positions.push(x,y,.035*(1-f*f));uvs.push(.5+x/(radius*2),.5+y/(radius*2));
  }
 }
 for(let i=0;i<segments;i++)indices.push(0,1+i,1+(i+1)%segments);
 for(let ring=1;ring<rings;ring++)for(let i=0;i<segments;i++){
  const a=1+(ring-1)*segments+i,b=1+(ring-1)*segments+(i+1)%segments,c=1+ring*segments+(i+1)%segments,d=1+ring*segments+i;
  indices.push(a,d,c,a,c,b);
 }
 const g=new BufferGeometry();g.setAttribute("position",new Float32BufferAttribute(positions,3));g.setAttribute("uv",new Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
/** Solid six-facet concave dish, opening toward local +Y, with a finished rim/back. */
export function createDishGeometry(){
 const profile=[[0,0],[.14,.014],[.34,.075],[.6,.25],[.62,.23],[.35,.035],[.14,-.025],[0,-.04]],b=builder();
 const point=(radius,y,i)=>[Math.cos(i*TAU/6)*radius,y,Math.sin(i*TAU/6)*radius];
 for(let row=0;row<profile.length-1;row++)for(let i=0;i<6;i++){
  const [r,y]=profile[row],[nextR,nextY]=profile[row+1];
  b.quad(point(r,y,i),point(r,y,i+1),point(nextR,nextY,i+1),point(nextR,nextY,i));
 }
 return b.finish();
}
