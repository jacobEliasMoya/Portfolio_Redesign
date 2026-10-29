import test from "node:test";
import assert from "node:assert/strict";
import {BoxGeometry,Color,Group,InstancedMesh,Matrix4,Mesh,MeshStandardMaterial,Vector3} from "three";
import {createCrashPool} from "../components/three/ufo/crash-pool.mjs";
function fixture(){const ship=new Group(),source=new InstancedMesh(new BoxGeometry(.2,.2,.2),new MeshStandardMaterial(),200);for(let i=0;i<200;i++){source.setMatrixAt(i,new Matrix4().makeTranslation(i*.01,0,0));source.setColorAt(i,new Color(.2,.4,.8));}ship.position.set(4,3,2);ship.add(source);return {ship,source};}
const event={kind:"crash",point:new Vector3(),normal:new Vector3(0,1,0),velocity:new Vector3(1,0,0)};
function prepare(pool){for(let i=0;i<100&&!pool.ready;i++)pool.prepare(100);assert.equal(pool.ready,true);}
test("hundreds of original tiles stay one debris batch, with preserved transforms/colors and no trigger allocations",()=>{
 const {ship,source}=fixture(),pool=createCrashPool(ship);prepare(pool);assert.equal(pool.batchCount,1);assert.equal(pool.fragmentCount,200);
 const batch=pool.root.children.find(o=>o instanceof InstancedMesh&&o.count===200),geometry=batch.geometry,material=batch.material,matrix=new Matrix4();
 pool.trigger(event);batch.getMatrixAt(0,matrix);assert.ok(Math.abs(matrix.elements[12]-4)<1e-6);assert.ok(Math.abs(matrix.elements[13]-3)<1e-6);
 const color=new Color();batch.getColorAt(0,color);assert.ok(Math.abs(color.b-.8)<1e-6);
 assert.equal(pool.step(.05,.05),true);assert.equal(pool.step(.05,2),false);assert.equal(batch.visible,false);
 pool.trigger(event);assert.equal(batch.geometry,geometry);assert.equal(batch.material,material);assert.equal(pool.batchCount,1);assert.equal(batch.visible,true);
 pool.dispose();assert.ok(source.geometry.getAttribute("position"));source.geometry.dispose();source.material.dispose();
});
test("gentle bumps and reduced-motion crashes use pooled sparks without visible ship fragments",()=>{
 const {ship}=fixture(),pool=createCrashPool(ship);prepare(pool);
 const sparks=pool.root.children[0],batch=pool.root.children[1];
 pool.trigger({...event,kind:"bounce"});assert.equal(sparks.count,8);assert.equal(batch.visible,false);pool.step(.1,.1);
 pool.trigger(event,true);assert.equal(sparks.count,3);assert.equal(batch.visible,false);const before=sparks.instanceMatrix.array.slice();pool.step(.1,.1);assert.deepEqual(sparks.instanceMatrix.array,before);
 pool.dispose();
});

test("continuous hull sections prepare before impact without losing triangles or color attributes",()=>{
 const ship=new Group(),geometry=new BoxGeometry(3,1,3),mesh=new Mesh(geometry,new MeshStandardMaterial());ship.add(mesh);
 const pool=createCrashPool(ship);prepare(pool);assert.ok(pool.batchCount>1&&pool.batchCount<=8);
 const count=pool.root.children.slice(1).reduce((sum,b)=>sum+b.geometry.getAttribute("position").count,0);
 assert.equal(count,geometry.index.count);pool.trigger(event);assert.equal(pool.step(.016,.016),true);pool.dispose();geometry.dispose();mesh.material.dispose();
});
