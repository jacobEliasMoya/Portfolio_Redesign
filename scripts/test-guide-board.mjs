import test from "node:test";
import assert from "node:assert/strict";
import {Matrix4,Vector3} from "three";
import {GUIDE_BUILD_SECONDS,createGuideBoardState} from "../components/three/ufo/guide-board-state.mjs";
import {GUIDE_BLOCK_LAYERS,GUIDE_BLOCK_FALL_SECONDS,guideBlockFormation,createGuideBoardModel,guideBlockPose,updateGuideBoardModel} from "../components/three/ufo/guide-board-model.mjs";
import {createGuideBoardCamera,resizeGuideBoardCamera,renderGuideBoardLayer} from "../components/three/ufo/guide-board-projection.mjs";

test("guide builds and reverses from any progress; React hears only discrete phase changes",()=>{
 const board=createGuideBoardState(),phases=[];let frames=0;
 const detach=board.subscribe(()=>phases.push(board.getSnapshot())),stop=board.subscribeFrame(()=>frames++);
 board.open();for(let i=0;i<15;i++)board.tick(1/60);const partial=board.getFrame().progress;
 board.close();assert.equal(board.getFrame().progress,partial);board.tick(1/60);assert.ok(board.getFrame().progress<partial);
 board.open();for(let i=0;i<150;i++)board.tick(1/60);assert.equal(board.getSnapshot(),"open");
 board.close();for(let i=0;i<60;i++)board.tick(1/60);assert.equal(board.getSnapshot(),"closed");assert.equal(board.getFrame().progress,0);
 assert.deepEqual(phases,["opening","closing","opening","open","closing","closed"]);assert.ok(frames>150);
 detach();stop();
 board.open(true);assert.equal(board.getSnapshot(),"open");assert.equal(board.getFrame().progress,1);board.close(true);assert.equal(board.getSnapshot(),"closed");
});

test("a single layer of overlapping cubes settles individually and stops uploading when settled",()=>{
 for(const [width,height] of [[904,544],[374,700],[704,330]]){
  const model=createGuideBoardModel(width,height);assert.ok(model.tiles.isInstancedMesh);assert.equal(model.root.children.length,2);
  updateGuideBoardModel(model,0);assert.equal(model.root.visible,false);
  for(let progress=.05;progress<=1;progress+=.05){updateGuideBoardModel(model,progress);assert.ok(model.tiles.instanceMatrix.array.every(Number.isFinite));}
  updateGuideBoardModel(model,1);
  const matrix=new Matrix4(),position=new Vector3();
  model.blocks.forEach((block,index)=>{
   assert.ok(block.depth>=Math.min(block.width,block.height)*.85&&block.depth<=Math.min(block.width,block.height)*1.15,"each block has roughly cubic proportions rather than a thin face");
   model.tiles.getMatrixAt(index,matrix);position.setFromMatrixPosition(matrix);
   assert.ok(Math.abs(position.y-block.y)<1e-4);assert.ok(Math.abs(position.x)+block.width/2<=width/2+10);
   assert.ok(Math.abs(position.y)+block.height/2<=height/2+10);
  });
  const version=model.tiles.instanceMatrix.version,colorVersion=model.tiles.instanceColor.version;updateGuideBoardModel(model,1);assert.equal(model.tiles.instanceMatrix.version,version);assert.equal(model.tiles.instanceColor.version,colorVersion);
  const first=model.blocks.find(block=>block.arrival===0),last=model.blocks.find(block=>block.arrival===1);
  assert.ok(guideBlockPose(first,.2).scale>0);assert.equal(guideBlockPose(last,.2).scale,0);
  for(const block of model.blocks)for(const progress of [.05,.2,.5,.8,1]){
   const pose=guideBlockPose(block,progress);assert.ok(Math.abs(pose.x-block.x)<=442.001);assert.ok(Math.abs(pose.y-block.y)<=417.001);assert.ok(pose.z>=block.z&&pose.z<=block.z+1430.001);
   assert.equal(pose.scale,pose.visible?1:0,"blocks do not grow from zero during flight");
  }
  const settled=guideBlockPose(model.blocks[0],1);assert.equal(settled.rx,model.blocks[0].rx);assert.equal(settled.scale,1);assert.ok(model.backing.visible);
  const columns=Math.max(3,Math.ceil(width/34));
  const perLayer=columns*Math.max(3,Math.ceil(height/34));
  assert.equal(model.blocks.length,perLayer*GUIDE_BLOCK_LAYERS);
  model.blocks.forEach((block,index)=>{
   if(index%columns<columns-1){const next=model.blocks[index+1];assert.ok((block.width+next.width)/2>Math.abs(next.x-block.x),"neighboring blocks overlap instead of leaving grid seams");}
   if(index%perLayer+columns<perLayer){const below=model.blocks[index+columns];assert.ok((block.height+below.height)/2>Math.abs(below.y-block.y));}
  });
  assert.equal(new Set(model.blocks.map(block=>block.layer)).size,1);
  const rear=Math.min(...model.blocks.map(block=>block.z-block.depth/2)),front=Math.max(...model.blocks.map(block=>block.z+block.depth/2));
  assert.ok(front-rear<80,"cubic depth remains without stacked rear layers");
  assert.ok(Math.max(...model.blocks.map(block=>block.depth))-Math.min(...model.blocks.map(block=>block.depth))>10);
  let disposed=0;model.geometry.addEventListener("dispose",()=>disposed++);model.dispose();assert.equal(disposed,1);
 }
});

test("each cube starts separately in a continuous sequence, without grouped bursts or pauses",()=>{
 const model=createGuideBoardModel(904,544),arrivals=model.blocks.map(block=>block.arrival).sort((a,b)=>a-b);
 assert.equal(new Set(arrivals).size,model.blocks.length);assert.equal(arrivals[0],0);assert.equal(arrivals.at(-1),1);
 const stagger=GUIDE_BUILD_SECONDS-GUIDE_BLOCK_FALL_SECONDS;
 for(let index=1;index<arrivals.length;index++)assert.ok((arrivals[index]-arrivals[index-1])*stagger<.01,"continuous individual starts have no inter-wave pauses");
 const inFlight=model.blocks.filter(block=>{const formation=guideBlockFormation(block,.5);return formation>0&&formation<1;});
 assert.ok(inFlight.length>1,"individual falls overlap continuously");
 for(const block of model.blocks){
  const start=block.arrival*stagger/GUIDE_BUILD_SECONDS;
  assert.equal(guideBlockFormation(block,start-1e-5),0);assert.ok(guideBlockFormation(block,start+1e-5)<1e-7);
  assert.equal(guideBlockFormation(block,1),1);
 }
 model.dispose();
});

test("perspective blocks cross the viewer, visibly recede at full size, and end aligned with CSS pixels on resize",()=>{
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  const camera=createGuideBoardCamera();resizeGuideBoardCamera(camera,width,height);
  const model=createGuideBoardModel(Math.min(width-40,704),Math.min(height-72,650));
  for(const [x,y] of [[0,0],[width*.21,height*.16],[-width*.3,-height*.22]]){
   const point=new Vector3(x,y,0).project(camera);
   assert.ok(Math.abs(point.x*width/2-x)<1e-8);assert.ok(Math.abs(point.y*height/2-y)<1e-8);
  }
  const block=model.blocks.filter(block=>block.layer===0).reduce((nearest,block)=>Math.hypot(block.x,block.y)<Math.hypot(nearest.x,nearest.y)?block:nearest),depth=camera.position.z;
  let crossed=false,previousZ=Infinity,largest=0;
  for(let step=0;step<=1000;step++){
   const pose=guideBlockPose(block,step/1000,undefined,depth);
   assert.ok(pose.z<=previousZ+1e-8);previousZ=pose.z;
   if(pose.z>depth)crossed=true;
   const distance=depth-pose.z;
   if(pose.visible&&distance>block.width*2&&distance<depth*.5){
    const a=new Vector3(pose.x-block.width/2,pose.y,pose.z).project(camera),b=new Vector3(pose.x+block.width/2,pose.y,pose.z).project(camera);
    const center=new Vector3(pose.x,pose.y,pose.z).project(camera);
    if(Math.abs(center.x)<1&&Math.abs(center.y)<1)largest=Math.max(largest,(b.x-a.x)*width/2/block.width);
    assert.equal(pose.scale,1);
   }
  }
  assert.ok(crossed);assert.ok(largest>2,"on-screen perspective makes passing blocks several times their resting size");
  assert.equal(guideBlockPose(block,1,undefined,depth).z,block.z);
  updateGuideBoardModel(model,.5,depth);const before=Array.from(model.tiles.instanceMatrix.array);
  resizeGuideBoardCamera(camera,height,width);updateGuideBoardModel(model,.5,camera.position.z);
  assert.notDeepEqual(Array.from(model.tiles.instanceMatrix.array),before,"resize changes the entry path even at unchanged progress");
  model.dispose();
 }
});

test("guide perspective pass preserves the HUD camera and renderer clearing state, including errors",()=>{
 const calls=[],hud={},hudCamera={},board={},boardCamera={};
 const gl={autoClear:true,render(scene,camera){calls.push([scene,camera,this.autoClear]);},clearDepth(){calls.push("depth");}};
 renderGuideBoardLayer(gl,hud,hudCamera,board,boardCamera,false);assert.deepEqual(calls,[[hud,hudCamera,true]]);
 calls.length=0;renderGuideBoardLayer(gl,hud,hudCamera,board,boardCamera,true);
 assert.deepEqual(calls,[[hud,hudCamera,true],"depth",[board,boardCamera,false]]);assert.equal(gl.autoClear,true);
 gl.render=(scene)=>{if(scene===board)throw Error("lost context");};
 assert.throws(()=>renderGuideBoardLayer(gl,hud,hudCamera,board,boardCamera,true));assert.equal(gl.autoClear,true);
 gl.autoClear=false;assert.throws(()=>renderGuideBoardLayer(gl,hud,hudCamera,board,boardCamera,true));assert.equal(gl.autoClear,false);
});
