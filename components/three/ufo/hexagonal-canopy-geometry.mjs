import {BufferGeometry,Float32BufferAttribute,IcosahedronGeometry,Vector3,CylinderGeometry,Quaternion} from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
/** Dual of a triangulated sphere: real hexagon/pentagon glass faces, clipped at the cockpit sill. */
export function createHexCanopy(){
 const source=new IcosahedronGeometry(1,1),positions=source.getAttribute("position"),vertices=[],lookup=new Map(),faces=[];
 for(let i=0;i<positions.count;i+=3){const ids=[];for(let k=0;k<3;k++){const v=new Vector3().fromBufferAttribute(positions,i+k).normalize(),key=v.toArray().map(n=>n.toFixed(5)).join(",");if(!lookup.has(key)){lookup.set(key,vertices.length);vertices.push({v,centers:[]});}ids.push(lookup.get(key));}const c=ids.reduce((sum,id)=>sum.add(vertices[id].v),new Vector3()).normalize();for(const id of ids)vertices[id].centers.push(c);}
 const data=[],colors=[],bars=[],edges=new Set();
 const world=v=>new Vector3(v.x*.77,.47+v.y*.59,v.z*.77);
 vertices.forEach(({v,centers},index)=>{
  const tangent=new Vector3().crossVectors(v,Math.abs(v.y)<.9?new Vector3(0,1,0):new Vector3(1,0,0)).normalize(),bitangent=new Vector3().crossVectors(v,tangent);
  centers.sort((a,b)=>Math.atan2(a.dot(bitangent),a.dot(tangent))-Math.atan2(b.dot(bitangent),b.dot(tangent)));
  const clipped=[];for(let i=0;i<centers.length;i++){const a=centers[i],b=centers[(i+1)%centers.length];if(a.y>=0)clipped.push(a.clone());if((a.y>=0)!==(b.y>=0))clipped.push(a.clone().lerp(b,-a.y/(b.y-a.y)));}
  if(clipped.length<3)return;const points=clipped.map(world),center=points.reduce((s,p)=>s.add(p),new Vector3()).multiplyScalar(1/points.length);faces.push(points.length);
  const tint=.7+Math.abs(Math.sin(index*13.7))*.3;
  for(let i=0;i<points.length;i++){let a=points[i],b=points[(i+1)%points.length];const normal=new Vector3().subVectors(a,center).cross(new Vector3().subVectors(b,center));if(normal.dot(v)<0)[a,b]=[b,a];for(const p of [center,a,b]){data.push(...p.toArray());colors.push(.035*tint,.38*tint,.48*tint);}
   const key=[a,b].map(p=>p.toArray().map(n=>n.toFixed(4)).join(",")).sort().join("|");if(edges.has(key))continue;edges.add(key);
   const direction=b.clone().sub(a),bar=new CylinderGeometry(.014,.014,direction.length(),5);bar.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.normalize()));bar.translate(...a.clone().add(b).multiplyScalar(.5).toArray());bars.push(bar);
  }
 });
 const glass=new BufferGeometry();glass.setAttribute("position",new Float32BufferAttribute(data,3));glass.setAttribute("color",new Float32BufferAttribute(colors,3));glass.computeVertexNormals();
 const frame=mergeGeometries(bars);bars.forEach(b=>b.dispose());source.dispose();return {glass,frame,faces};
}
