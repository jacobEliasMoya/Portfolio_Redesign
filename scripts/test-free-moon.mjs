import test from "node:test";
import assert from "node:assert/strict";
import {releaseMoon,advanceFreeMoon,getMoonOrbitPose} from "../components/three/moon/moon-orbit.mjs";
test("Moon release preserves its position and tangent orbital velocity",()=>{
 const motion=releaseMoon(23,15),pose=getMoonOrbitPose(23,15);assert.deepEqual(motion.position,pose.position);
 assert.ok(Math.abs(motion.position.reduce((sum,p,i)=>sum+p*motion.velocity[i],0))<1e-10);
 assert.equal(motion.rotation[1],pose.yaw);
});
test("released Moon drifts in a straight line without drag while tumbling",()=>{
 const motion=releaseMoon(12,15),start=[...motion.position],velocity=[...motion.velocity],yaw=motion.rotation[1];
 for(let i=0;i<120;i++)advanceFreeMoon(motion,1/60);
 for(let i=0;i<3;i++)assert.ok(Math.abs(motion.position[i]-start[i]-velocity[i]*2)<1e-9);
 assert.deepEqual(motion.velocity,velocity);assert.ok(motion.rotation[0]>0);assert.ok(motion.rotation[1]>yaw);assert.ok(motion.rotation[2]>0);
 const before=JSON.stringify(motion);advanceFreeMoon(motion,0);assert.equal(JSON.stringify(motion),before);
});
