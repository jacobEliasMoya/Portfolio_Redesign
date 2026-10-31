import {PerspectiveCamera} from "three";

/** One world unit equals one CSS pixel on the resting board plane (Z=0).
 * Only the Guide uses this camera; the existing HUD remains orthographic. */
export function createGuideBoardCamera(){return new PerspectiveCamera(35,1,12,10000);}
export function resizeGuideBoardCamera(camera,width,height){
 const aspect=Math.max(1,width)/Math.max(1,height);
 const distance=Math.max(1,height)/(2*Math.tan(camera.fov*Math.PI/360));
 if(camera.aspect===aspect&&camera.position.z===distance)return;
 camera.aspect=aspect;camera.position.set(0,0,distance);camera.far=distance*4;
 camera.updateProjectionMatrix();camera.updateMatrixWorld();
}

/** Composite with the same WebGL context, without changing the HUD's camera
 * or leaving renderer state altered for the next frame. */
export function renderGuideBoardLayer(gl,hudScene,hudCamera,boardScene,boardCamera,visible){
 gl.render(hudScene,hudCamera);
 if(!visible)return;
 const autoClear=gl.autoClear;
 try{gl.autoClear=false;gl.clearDepth();gl.render(boardScene,boardCamera);}
 finally{gl.autoClear=autoClear;}
}
