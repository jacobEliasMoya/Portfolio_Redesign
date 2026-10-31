import {Matrix4,Quaternion,Vector3} from "three";
export const LUNAR_PAD_HEIGHT=.98,LUNAR_PAD_SCALE=.8;
export const LUNAR_PAD_SUPPORT_TOP=-.1,LUNAR_PAD_SUPPORT_HEIGHT=.4;
const up=new Vector3(0,1,0);
export function createLunarPadPose(){return {initialized:false,center:new Vector3(),point:new Vector3(),scale:new Vector3(),parentRotation:new Quaternion(),rotation:new Quaternion(),candidate:new Vector3(),forward:new Vector3(0,0,-1),right:new Vector3(),basis:new Matrix4()};}

/** Capture a level default pose once, in Moon-local space. Thereafter the
 * Moon owns the pad's motion, including orbit, drag and rotation. */
export function initializeLunarPad(pad,pose){
 if(pose.initialized)return true;
 const parent=pad.parent;if(!parent)return false;
 parent.updateWorldMatrix(true,false);
 if(Math.abs(parent.matrixWorld.determinant())<1e-12)return false;
 parent.getWorldScale(pose.scale);
 if(!Number.isFinite(pose.scale.y)||Math.abs(pose.scale.y)<1e-6)return false;
 parent.getWorldPosition(pose.center);parent.getWorldQuaternion(pose.parentRotation);
 pose.point.copy(pose.center).addScaledVector(up,LUNAR_PAD_HEIGHT*Math.abs(pose.scale.y));
 pad.position.copy(parent.worldToLocal(pose.point));
 pose.candidate.set(0,0,1).applyQuaternion(pose.parentRotation);pose.candidate.y=0;
 if(pose.candidate.lengthSq()>1e-8)pose.forward.copy(pose.candidate).normalize();
 pose.right.crossVectors(up,pose.forward).normalize();pose.basis.makeBasis(pose.right,up,pose.forward);
 pose.rotation.setFromRotationMatrix(pose.basis);
 pad.quaternion.copy(pose.parentRotation).invert().multiply(pose.rotation);pad.updateWorldMatrix(false,false);
 pose.initialized=true;
 return true;
}
