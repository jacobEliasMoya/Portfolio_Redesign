import {Matrix4,Raycaster,Sphere,Vector2,Vector3} from "three";

/** One owner per canvas gesture; only the nearest hit starts dragging. */
export function createObjectDragController(canvas,camera,invalidate){
 const targets=new Set(),touches=new Set(),ray=new Raycaster(),screen=new Vector2();let active=null,pointer=null,lastX=0,lastY=0;
 const previousTouchAction=canvas.style.touchAction;canvas.style.touchAction="none";
 const cancel=()=>{const target=active,id=pointer;active=null;pointer=null;target?.end?.();if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);invalidate();};
 const down=e=>{
  if(e.pointerType==="touch"){touches.add(e.pointerId);if(touches.size>1){cancel();return;}}
  if(e.button!==0||pointer!==null)return;
  const bounds=canvas.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
  screen.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);camera.updateMatrixWorld();ray.setFromCamera(screen,camera);
  let winner=null,distance=Infinity;
  for(const target of targets){if(!target.enabled())continue;const hit=target.hit(ray.ray);if(Number.isFinite(hit)&&hit>=0&&hit<distance){winner=target;distance=hit;}}
  if(!winner)return;
  active=winner;pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;active.start?.(ray.ray.at(distance,new Vector3()));canvas.setPointerCapture(pointer);e.preventDefault();invalidate();
 };
 const move=e=>{if(pointer!==e.pointerId||!active)return;if(!active.enabled()){cancel();return;}active.move({dx:e.clientX-lastX,dy:e.clientY-lastY,camera});lastX=e.clientX;lastY=e.clientY;e.preventDefault();invalidate();};
 const up=e=>{touches.delete(e.pointerId);if(pointer===e.pointerId)cancel();};
 const blur=()=>{touches.clear();cancel();};
 canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);canvas.addEventListener("lostpointercapture",up);
 const host=canvas.ownerDocument?.defaultView;host?.addEventListener("blur",blur);
 return {add(target){targets.add(target);return()=>{if(active===target)cancel();targets.delete(target);};},dispose(){cancel();canvas.style.touchAction=previousTouchAction;canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up);canvas.removeEventListener("lostpointercapture",up);host?.removeEventListener("blur",blur);}};
}

/** Small sphere tests at pointerdown, avoiding per-triangle raycasts on terrain/text. */
export function createDragHitTest(object,radius,instances=false){const sphere=new Sphere(),point=new Vector3(),matrix=new Matrix4();
 return ray=>{
  const mesh=object.current;if(!mesh)return Infinity;let parent=mesh;while(parent){if(!parent.visible)return Infinity;parent=parent.parent;}
  mesh.updateWorldMatrix(true,false);let distance=Infinity;
  const test=world=>{sphere.center.setFromMatrixPosition(world);sphere.radius=radius*world.getMaxScaleOnAxis();if(sphere.radius<1e-5)return;if(ray.intersectSphere(sphere,point))distance=Math.min(distance,ray.origin.distanceTo(point));};
  if(!instances)test(mesh.matrixWorld);
  else for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);if(matrix.elements[0]===0&&matrix.elements[5]===0&&matrix.elements[10]===0)continue;matrix.premultiply(mesh.matrixWorld);test(matrix);}
  return distance;
 };
}

/** Convert screen movement to a slide on the existing world-Y text orbit. */
export function orbitSlideDelta(dx,dy,angle,cameraQuaternion){
 const tangent=new Vector3(Math.cos(angle),0,-Math.sin(angle)),right=new Vector3(1,0,0).applyQuaternion(cameraQuaternion),up=new Vector3(0,1,0).applyQuaternion(cameraQuaternion),x=tangent.dot(right),y=tangent.dot(up);
 return Math.max(-.25,Math.min(.25,(dx*x-dy*y)*.005/Math.max(.2,x*x+y*y)));
}
