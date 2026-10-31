import {BoxGeometry,Color,ConeGeometry,CylinderGeometry,ExtrudeGeometry,Float32BufferAttribute,MeshStandardMaterial,Path,Shape,Vector2,Vector3,LatheGeometry} from "three";
import {ROCKET_STAGING} from "./rocket-event.mjs";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
/** Relative plan: .13 core diameter, 2.68 total height, .148 side offsets; wider .188 fairing.
 * Reference: SpaceX Falcon Heavy overview / Falcon User's Guide. No downloaded textures or logos. */
export const HEAVY_SIDE_OFFSET=.148;
const WHITE="#eeeae1",DARK="#1b2026",TRIM="#788087";
function builder(){
 const pieces=[];
 return {add(source,color,x=0,y=0,z=0,ry=0){const g=source.index?source.toNonIndexed():source.clone();source.dispose();g.rotateY(ry);g.translate(x,y,z);const tint=new Color(color),colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3)tint.toArray(colors,i);g.setAttribute("color",new Float32BufferAttribute(colors,3));pieces.push(g);},finish(){const g=mergeGeometries(pieces);pieces.forEach(p=>p.dispose());return g;}};
}
function profile(points){return new LatheGeometry(points.map(([r,y])=>new Vector2(r,y)),12);}
function gridFin(){
 const shape=new Shape(),w=.07,h=.09;shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();
 for(let x=0;x<2;x++)for(let y=0;y<3;y++){const x0=-w/2+.007+x*(w-.007)/2,y0=-h/2+.007+y*(h-.007)/3,x1=x0+(w-.007)/2-.007,y1=y0+(h-.007)/3-.007,hole=new Path();hole.moveTo(x0,y0);hole.lineTo(x0,y1);hole.lineTo(x1,y1);hole.lineTo(x1,y0);hole.closePath();shape.holes.push(hole);}
 const g=new ExtrudeGeometry(shape,{depth:.004,bevelEnabled:false,curveSegments:1,steps:1});g.translate(0,0,-.002);return g;
}
function foldedLeg(){const shape=new Shape();shape.moveTo(-.026,-.77);shape.lineTo(-.02,-.61);shape.lineTo(0,-.28);shape.lineTo(.02,-.61);shape.lineTo(.026,-.77);shape.closePath();const g=new ExtrudeGeometry(shape,{depth:.009,bevelEnabled:false,curveSegments:1,steps:1});g.translate(0,0,-.0045);return g;}
function firstStage(side=false){
 const b=builder(),top=side?.60:.725;
 b.add(new CylinderGeometry(.065,.065,top+.82,12),WHITE,0,(top-.82)/2);
 b.add(new CylinderGeometry(.067,.067,.09,12),DARK,0,-.79);
 b.add(new CylinderGeometry(.066,.066,.015,12),TRIM,0,-.1);
 b.add(new BoxGeometry(.011,1.29,.009),"#d1d1ca",0,-.07,.067);
 for(let i=0;i<9;i++){const angle=(i-1)*Math.PI/4,r=i===0?0:.041;b.add(new CylinderGeometry(.009,.017,.075,6,1,true),"#44484b",Math.cos(angle)*r,-.885,Math.sin(angle)*r);}
 for(let i=0;i<4;i++){const angle=Math.PI/4+i*Math.PI/2,x=Math.sin(angle)*.071,z=Math.cos(angle)*.071;b.add(gridFin(),DARK,x,top-.065,z,angle);b.add(foldedLeg(),DARK,x,0,z,angle);}
 if(side)b.add(profile([[.065,.60],[.064,.65],[.055,.71],[.037,.77],[.015,.805],[.001,.815]]),WHITE);
 else b.add(new CylinderGeometry(.066,.066,.195,12),DARK,0,.8225);
 return b.finish();
}
function upperStage(){const b=builder();b.add(new CylinderGeometry(.065,.065,.215,12),WHITE,0,1.0275);b.add(new CylinderGeometry(.02,.052,.075,8,1,true),DARK,0,.9);b.add(profile([[.065,1.135],[.094,1.24],[.094,1.50],[.088,1.59],[.065,1.67],[.034,1.72],[.001,1.74]]),WHITE);return b.finish();}
function centered(geometry){geometry.computeBoundingBox();const pivot=geometry.boundingBox.getCenter(new Vector3());geometry.translate(-pivot.x,-pivot.y,-pivot.z);geometry.computeBoundingBox();geometry.computeBoundingSphere();return {geometry,pivot};}
function legend(){const b=builder();b.add(new CylinderGeometry(.165,.165,1.5,8),"#b8c3c8",0,-.02);b.add(new ConeGeometry(.165,.46,8),"#d7e1e3",0,.96);b.add(new CylinderGeometry(.17,.17,.13,8),DARK,0,-.57);b.add(new CylinderGeometry(.08,.13,.14,6),DARK,0,-.82);for(const side of [-1,1]){b.add(new BoxGeometry(.2,.36,.055),"#9ba9af",side*.2,-.5);b.add(new BoxGeometry(.12,.18,.045),"#d7e1e3",side*.18,.6);}b.add(new BoxGeometry(.2,.07,.018),"#142b3e",0,.77,.117);for(const y of [-.32,.13])b.add(new CylinderGeometry(.167,.167,.018,8),TRIM,0,y);return b.finish();}
export function createRocketModel(tier){
 const material=new MeshStandardMaterial({vertexColors:true,roughness:tier.id==="legendary"?.55:.72,metalness:tier.id==="legendary"?.35:.08}),owned=new Set();
 let body,core,upper,detachable=[];
 if(tier.id==="legendary"){body=centered(legend());core=body;upper=body;}
 else{
  const lowerRaw=firstStage(),upperRaw=upperStage(),coreRaw=mergeGeometries([lowerRaw,upperRaw]);let fullRaw=coreRaw;
  if(tier.id==="rare"){
   const boosterRaw=firstStage(true),left=boosterRaw.clone().translate(-HEAVY_SIDE_OFFSET,0,0),right=boosterRaw.clone().translate(HEAVY_SIDE_OFFSET,0,0),bridges=builder();
   for(const y of [-.68,.59])bridges.add(new BoxGeometry(.265,.018,.025),DARK,0,y);
   const bridge=bridges.finish();fullRaw=mergeGeometries([coreRaw,left,right,bridge]);left.dispose();right.dispose();bridge.dispose();
   const booster=centered(boosterRaw);owned.add(booster.geometry);
   detachable=[-1,1].map(side=>({id:side<0?"left":"right",geometry:booster.geometry,pivot:booster.pivot.clone().add(new Vector3(side*HEAVY_SIDE_OFFSET,0,0)),side,release:ROCKET_STAGING.sideBoosters}));
  }
  body=centered(fullRaw);core=fullRaw===coreRaw?body:centered(coreRaw);upper=centered(upperRaw);const lower=centered(lowerRaw);owned.add(lower.geometry);
  detachable.push({id:"first-stage",geometry:lower.geometry,pivot:lower.pivot,side:0,release:tier.id==="rare"?ROCKET_STAGING.heavyCore:ROCKET_STAGING.standardCore});
 }
 for(const part of [body,core,upper])owned.add(part.geometry);
 return {stages:{full:body,core,upper,single:body},geometry:body.geometry,pivot:body.pivot,coreGeometry:core.geometry,corePivot:core.pivot,upperGeometry:upper.geometry,upperPivot:upper.pivot,detachable,material,dispose(){owned.forEach(g=>g.dispose());material.dispose();}};
}
