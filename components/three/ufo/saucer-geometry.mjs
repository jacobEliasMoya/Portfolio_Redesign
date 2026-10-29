import { CatmullRomCurve3, LatheGeometry, SphereGeometry, TubeGeometry, Vector2, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
export const SAUCER_RADIUS = 2.23;
const profile = [[0,-.43],[.45,-.43],[.6,-.40],[.95,-.31],[1.55,-.18],[2.13,-.075],[2.205,-.055],[2.23,-.025],[2.23,.035],[2.205,.065],[2.12,.09],[1.65,.23],[1.05,.40],[.88,.44],[0,.44]];
export function createSaucerGeometry(){
  const hull=new LatheGeometry(profile.map(([x,y])=>new Vector2(x,y)),24);
  const canopy=new SphereGeometry(.82,18,7,0,Math.PI*2,0,Math.PI/2);
  canopy.scale(1,.74,1);canopy.translate(0,.44,0);
  const ribs=[];
  for(let i=0;i<6;i++){
    const path=new CatmullRomCurve3([new Vector3(.825,.44,0),new Vector3(.69,.775,0),new Vector3(.39,.985,0),new Vector3(0,1.055,0)]);
    const rib=new TubeGeometry(path,12,.022,5,false);rib.rotateY(i*Math.PI/3);ribs.push(rib);
  }
  const frame=mergeGeometries(ribs);ribs.forEach((rib)=>rib.dispose());
  const belt=new LatheGeometry([[2.20,-.052],[2.235,-.035],[2.235,.035],[2.20,.052],[2.20,-.052]].map(([x,y])=>new Vector2(x,y)),24);
  const engine=new LatheGeometry([[.27,-.54],[.36,-.54],[.54,-.49],[.62,-.41],[.58,-.36],[.32,-.42],[.27,-.46],[.27,-.54]].map(([x,y])=>new Vector2(x,y)),12);
  return {hull,canopy,frame,belt,engine};
}
