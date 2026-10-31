import {performance} from "node:perf_hooks";
import {Vector3} from "three";
import {impactFixture} from "./impact-fixture.mjs";
const percentile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))];
for(const kind of ["earth","moon"]){
 const f=impactFixture(kind);f.target.setExplosionsEnabled(false);f.target.prepareIndex(Infinity);
 const from=new Vector3(0,0,30),to=new Vector3(0,0,-50),queries=[],damage=[];
 for(let i=0;i<100;i++){const start=performance.now();f.target.query(from,to,i/60);queries.push(performance.now()-start);}
 for(let i=0;i<40;i++){
  const radius=kind==="earth"?3:.82,angle=Math.sin(i*.5)*.12;
  const hit=f.target.query(new Vector3(Math.sin(angle)*radius*2,0,Math.cos(angle)*radius*2),new Vector3(),i*.2);
  if(!hit)continue;const start=performance.now();hit.destroy(.2);damage.push(performance.now()-start);
 }
 console.log(JSON.stringify({kind,tiles:f.mesh.count,queryMs:{p50:percentile(queries,.5),p95:percentile(queries,.95)},damageMs:{first:damage[0],p50:percentile(damage,.5),p95:percentile(damage,.95),last:damage.at(-1)}}));
 f.dispose();
}
