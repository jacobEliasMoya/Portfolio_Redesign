import test from "node:test";
import assert from "node:assert/strict";
import {BoxGeometry,Group,InstancedMesh,MeshBasicMaterial,Matrix4,Vector3} from "three";
import {createFlight} from "../components/three/ufo/saucer-flight.mjs";
import {resolveSaucerContact,samplePlanetContacts} from "../components/three/ufo/saucer-crash.mjs";
test("gentle contact bounces while a fast normal impact crashes",()=>{
 for(const [speed,kind] of [[1,"bounce"],[6,"crash"]]){const s=createFlight([0,0,3.2]);s.velocity.set(0,0,-speed);const impact=resolveSaucerContact(s,new Vector3(0,0,3),new Vector3(0,0,1),.5);assert.equal(impact.kind,kind);assert.ok(s.position.z>=3.5);assert.ok(s.velocity.z>0);}
});
test("glancing speed does not become a hard crash and separated craft stays untouched",()=>{
 const s=createFlight([0,0,3.2]);s.velocity.set(7,0,-.5);assert.equal(resolveSaucerContact(s,new Vector3(0,0,3),new Vector3(0,0,1),.5).kind,"bounce");
 s.position.z=5;assert.equal(resolveSaucerContact(s,new Vector3(0,0,3),new Vector3(0,0,1),.5),null);
});

test("transformed Moon participates in flight contacts and stops colliding after destruction",async()=>{
 const {createDestructible,registerProjectileTarget}=await import("../components/three/ufo/projectile-collision.mjs");
 const mesh=new InstancedMesh(new BoxGeometry(.1,.1,.1),new MeshBasicMaterial(),1);mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,.82));
 const parent=new Group();parent.position.set(8,2,-4);parent.rotation.y=.4;parent.scale.setScalar(2);parent.add(mesh);const scene=new Group();scene.add(parent);scene.updateMatrixWorld(true);
 const target=createDestructible(mesh,new Set(),{foundation:.7,threshold:1}),cleanup=registerProjectileTarget(mesh,target);
 const ship=new Vector3(0,0,1).applyMatrix4(mesh.matrixWorld);assert.equal(samplePlanetContacts(scene,ship,.5,1).length,1);
 target.query(new Vector3(0,0,2).applyMatrix4(mesh.matrixWorld),new Vector3(0,0,.5).applyMatrix4(mesh.matrixWorld),1).destroy();assert.equal(samplePlanetContacts(scene,ship,.5,2).length,0);cleanup();
});

test("moving Moon impact is classified using relative velocity",()=>{
 const s=createFlight([0,0,3.2]);s.velocity.set(0,0,0);
 const contact=resolveSaucerContact(s,new Vector3(0,0,3),new Vector3(0,0,1),.5,new Vector3(0,0,4));
 assert.equal(contact.kind,"crash");assert.equal(contact.speed,4);
});
