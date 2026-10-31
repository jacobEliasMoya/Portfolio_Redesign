import {Color,DynamicDrawUsage,Group,InstancedMesh,Mesh,MeshStandardMaterial,Object3D} from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {GUIDE_BUILD_SECONDS} from "./guide-board-state.mjs";
const noise=index=>{const value=Math.sin(index*127.1+311.7)*43758.5453;return value-Math.floor(value);};
export const GUIDE_BLOCK_LAYERS=1;
export const GUIDE_BLOCK_FALL_SECONDS=.65;

/** Every cube starts separately; falls overlap without grouped beats or pauses. */
export function guideBlockFormation(block,progress){
 if(progress<=0)return 0;if(progress>=1)return 1;
 const start=block.arrival*(GUIDE_BUILD_SECONDS-GUIDE_BLOCK_FALL_SECONDS);
 const t=Math.max(0,Math.min(1,(progress*GUIDE_BUILD_SECONDS-start)/GUIDE_BLOCK_FALL_SECONDS));
 return t*t*(3-2*t);
}

/** Chunky cubes with a raised rim and recessed list surface. */
export function createGuideBoardModel(width,height){
 const root=new Group(),geometry=new RoundedBoxGeometry(1,1,1,1,.035);
 const material=new MeshStandardMaterial({roughness:.64,metalness:.12,toneMapped:false});
 const columns=Math.max(3,Math.ceil(width/34)),rows=Math.max(3,Math.ceil(height/34)),cellX=width/columns,cellY=height/rows;
 const blocks=[];
 for(let layer=0;layer<GUIDE_BLOCK_LAYERS;layer++)for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const edge=row===0||row===rows-1||col===0||col===columns-1;
  const index=layer*rows*columns+row*columns+col;
  const size=(edge?1.18:1.26)+noise(index+23)*(edge?.16:.39),jitter=edge?.12:.18;
  blocks.push({x:-width/2+(col+.5)*cellX+(noise(index+29)-.5)*cellX*jitter,y:height/2-(row+.5)*cellY+(noise(index+31)-.5)*cellY*jitter,
   z:(edge?10:0)-layer*32+(noise(index+37)-.5)*3,width:cellX*size,height:cellY*size,depth:Math.min(cellX,cellY)*size*(.85+noise(index+41)*.3),layer,
   rx:(noise(index+43)-.5)*.04,ry:(noise(index+47)-.5)*.04,rz:(noise(index+53)-.5)*.025,
   scatterX:(noise(index+3)-.5)*180,scatterY:(noise(index+5)-.5)*130,entryAngle:Math.atan2(height/2-(row+.5)*cellY+(noise(index+11)-.5)*200,-width/2+(col+.5)*cellX+(noise(index+13)-.5)*200),entryDepth:1.12+noise(index+7)*.18,
   color:edge?(layer?"#204753":row===0||col===0?"#285b68":"#173742"):"#09152c"});
 }
 // Deterministic spatially mixed order: a single cube per start time,
 // rather than simultaneously starting rows or bands.
 blocks.map((block,index)=>({block,order:noise(index+71)})).sort((a,b)=>a.order-b.order).forEach(({block},index)=>{block.arrival=index/Math.max(1,blocks.length-1);});
 const tiles=new InstancedMesh(geometry,material,blocks.length);tiles.instanceMatrix.setUsage(DynamicDrawUsage);tiles.frustumCulled=false;
 const tint=new Color();blocks.forEach((block,index)=>{tint.set(block.color).multiplyScalar(.92+noise(index+59)*.16);block.tint=tint.clone();tiles.setColorAt(index,tint);});
 const backingMaterial=new MeshStandardMaterial({color:"#061020",roughness:.9,toneMapped:false});
 const backing=new Mesh(geometry,backingMaterial);backing.scale.set(width-2,height-2,3);backing.position.z=-14-(GUIDE_BLOCK_LAYERS-1)*32;
 root.add(backing,tiles);root.name="Block-built explorer guide";
 return {root,geometry,material,backingMaterial,tiles,backing,blocks,tint,transform:new Object3D(),width,height,
  dispose(){geometry.dispose();material.dispose();backingMaterial.dispose();tiles.dispose();}};
}

/** Full-size blocks cross the viewer plane, then recede into the board with
 * an individual stagger. Perspective, not scale-from-zero, supplies the zoom. */
export function guideBlockPose(block,progress,out={x:0,y:0,z:0,rx:0,ry:0,rz:0,scale:0,pulse:0,visible:false},travelDepth=1100){
 const formation=guideBlockFormation(block,progress),remaining=1-formation;
 // Keep the immediate camera crossing outside the central viewing corridor;
 // blocks sweep into view at readable size instead of covering the lens.
 const corridor=travelDepth*.32*remaining*remaining;
 out.visible=formation>0;out.x=block.x+block.scatterX*remaining+Math.cos(block.entryAngle)*corridor;out.y=block.y+block.scatterY*remaining+Math.sin(block.entryAngle)*corridor;out.z=block.z+travelDepth*block.entryDepth*remaining;
 out.rx=block.rx+remaining*1.5;out.ry=block.ry+remaining*1.1;out.rz=block.rz+remaining*Math.sin(block.x)*.5;
 out.scale=out.visible?1:0;out.pulse=Math.sin(formation*Math.PI)*.15;return out;
}
export function updateGuideBoardModel(model,progress,travelDepth=1100){
 if(model.lastProgress===progress&&model.lastTravelDepth===travelDepth)return;
 model.lastProgress=progress;model.lastTravelDepth=travelDepth;
 const transform=model.transform,pose=model.pose??(model.pose={x:0,y:0,z:0,rx:0,ry:0,rz:0,scale:0,pulse:0,visible:false});
 model.blocks.forEach((block,index)=>{
  guideBlockPose(block,progress,pose,travelDepth);transform.position.set(pose.x,pose.y,pose.z);transform.rotation.set(pose.rx,pose.ry,pose.rz);
  transform.scale.set(block.width*pose.scale,block.height*pose.scale,block.depth*pose.scale);transform.updateMatrix();model.tiles.setMatrixAt(index,transform.matrix);
  model.tint.copy(block.tint).multiplyScalar(1+pose.pulse);model.tiles.setColorAt(index,model.tint);
 });
 model.tiles.instanceMatrix.needsUpdate=true;model.tiles.instanceColor.needsUpdate=true;model.backing.visible=progress>.97;model.root.visible=progress>0;
}
