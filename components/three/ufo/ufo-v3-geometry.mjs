import {BufferGeometry,Float32BufferAttribute,Vector3} from "three";
import {mergeVertices} from "three/addons/utils/BufferGeometryUtils.js";

export const V3_RADIUS=2.23;
const COS30=Math.sqrt(3)/2,planes=Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return [Math.cos(a),Math.sin(a)];});
export function hexOutline(radius,center=[0,0]){return Array.from({length:6},(_,i)=>[center[0]+Math.cos(i*Math.PI/3)*radius,center[1]+Math.sin(i*Math.PI/3)*radius]);}
function clip(poly,n,c,inside=true){const out=[];
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*n[0]+a[1]*n[1]-c,db=b[0]*n[0]+b[1]*n[1]-c,ka=inside?da<=1e-9:da>=-1e-9,kb=inside?db<=1e-9:db>=-1e-9;
  if(ka)out.push(a);if(ka!==kb){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
 }return out;
}
function area(poly){return Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;}
/** Difference against a convex hexagon; retained pieces are disjoint. */
function subtractHex(poly,radius,center,sides=6){
 const boundaries=sides===6?planes:Array.from({length:sides},(_,i)=>{const a=(i+.5)*Math.PI*2/sides;return [Math.cos(a),Math.sin(a)];}),apothem=radius*Math.cos(Math.PI/sides);
 let intersection=poly;for(const n of boundaries)intersection=clip(intersection,n,apothem+center[0]*n[0]+center[1]*n[1]);
 if(intersection.length<3||area(intersection)<1e-8)return [poly];
 let remaining=poly;const outside=[];
 for(const n of boundaries){if(remaining.length<3)break;const c=apothem+center[0]*n[0]+center[1]*n[1],part=clip(remaining,n,c,false);if(part.length>=3&&area(part)>1e-5)outside.push(part);remaining=clip(remaining,n,c,true);}
 return outside;
}
export function polygonRadius(x,z){return Math.max(...planes.map(n=>x*n[0]+z*n[1]))/(V3_RADIUS*COS30);}
export function v3Height(x,z,side=1){const t=Math.max(0,Math.min(1,polygonRadius(x,z)));
 return side>0?.48-.38*Math.pow(t,1.65):-.39+.26*Math.pow(t,1.6);
}
export function createV3PanelLayout(side=1){
 const width=side>0?.43:.53,radius=width/Math.sqrt(3),holes=side>0?[[.94,[0,0],48]]:[[.67,[0,0],6],...Array.from({length:3},(_,i)=>{const a=i*Math.PI*2/3;return [.305,[Math.sin(a)*1.22,Math.cos(a)*1.22],6];})],panels=[];
 for(let row=-9;row<=9;row++)for(let col=-9;col<=9;col++){
  const x=(col+(Math.abs(row)%2)*.5)*width,z=row*radius*1.5;
  let poly=Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return [x+Math.cos(a)*radius,z+Math.sin(a)*radius];});
  for(const n of planes)poly=clip(poly,n,(V3_RADIUS-.065)*COS30);
  if(poly.length<3||area(poly)<.006)continue;
  let pieces=[poly];for(const [r,c,sides] of holes)pieces=pieces.flatMap(p=>subtractHex(p,r,c,sides));
  for(const piece of pieces){if(area(piece)<.003)continue;const cx=piece.reduce((s,p)=>s+p[0],0)/piece.length,cz=piece.reduce((s,p)=>s+p[1],0)/piece.length;
   // A small even reveal separates the armor instead of stacking arbitrary overlaps.
   panels.push({points:piece.map(p=>[cx+(p[0]-cx)*.975,cz+(p[1]-cz)*.975]),side,shade:Math.abs((row*13+col*7)%5),relief:(Math.sin(row*13.7+col*31.3)+1)*.007});
  }
 }return panels;
}
function builder(){const positions=[],normals=[],uvs=[],a=new Vector3(),b=new Vector3(),n=new Vector3();
 const tri=(p,q,r)=>{a.set(q[0]-p[0],q[1]-p[1],q[2]-p[2]);b.set(r[0]-p[0],r[1]-p[1],r[2]-p[2]);n.crossVectors(a,b);if(n.lengthSq()<1e-15)return;n.normalize();for(const v of [p,q,r]){positions.push(...v);normals.push(...n.toArray());uvs.push(v[0],v[2]);}};
 return {tri,quad(p,q,r,s){tri(p,q,r);tri(p,r,s);},finish(){const raw=new BufferGeometry();raw.setAttribute("position",new Float32BufferAttribute(positions,3));raw.setAttribute("normal",new Float32BufferAttribute(normals,3));raw.setAttribute("uv",new Float32BufferAttribute(uvs,2));const g=mergeVertices(raw,1e-6);raw.dispose();g.computeBoundingBox();g.computeBoundingSphere();return g;}};
}
/** Profile uses [corner radius,Y]; closed=true makes a hollow ring rather than a cap. */
export function createHexLoft(profile,closed=false){const b=builder(),v=(r,y,i)=>[Math.cos(i*Math.PI/3)*r,y,Math.sin(i*Math.PI/3)*r];
 for(let row=0;row<(closed?profile.length:profile.length-1);row++){const [r,y]=profile[row],[s,z]=profile[(row+1)%profile.length];for(let i=0;i<6;i++)b.quad(v(r,y,i),v(r,y,i+1),v(s,z,i+1),v(s,z,i));}
 return b.finish();
}
export function createV3PanelGeometry(panel){const {points,side,relief}=panel,b=builder(),cx=points.reduce((s,p)=>s+p[0],0)/points.length,cz=points.reduce((s,p)=>s+p[1],0)/points.length;
 const outer=points.map(([x,z])=>[x,v3Height(x,z,side)+side*(.04+relief),z]),top=points.map(([x,z])=>{const xx=cx+(x-cx)*.95,zz=cz+(z-cz)*.95;return [xx,v3Height(xx,zz,side)+side*(.057+relief),zz];}),bottom=points.map(([x,z])=>[x,v3Height(x,z,side)-side*.04,z]);
 const center=[cx,v3Height(cx,cz,side)+side*(.057+relief),cz],base=[cx,v3Height(cx,cz,side)-side*.04,cz];
 for(let i=0;i<points.length;i++){const j=(i+1)%points.length;
  if(side>0){b.tri(center,top[j],top[i]);b.quad(top[i],top[j],outer[j],outer[i]);b.quad(outer[i],outer[j],bottom[j],bottom[i]);b.tri(base,bottom[i],bottom[j]);}
  else {b.tri(center,top[i],top[j]);b.quad(top[j],top[i],outer[i],outer[j]);b.quad(outer[j],outer[i],bottom[i],bottom[j]);b.tri(base,bottom[j],bottom[i]);}
 }return b.finish();
}
