import test from "node:test";
import assert from "node:assert/strict";
import {BufferGeometry,Float32BufferAttribute} from "three";
import {scorchLunarSkin} from "../components/three/moon/lunar-impact.mjs";
test("lunar impact darkens exposed skin locally without opening geometry holes",()=>{
 const geometry=new BufferGeometry();geometry.setAttribute("position",new Float32BufferAttribute([0,0,.82,.04,0,.82,1,0,0],3));geometry.setAttribute("color",new Float32BufferAttribute([.8,.8,.8,.8,.8,.8,.8,.8,.8],3));
 const before=geometry.attributes.position.array.slice();assert.equal(scorchLunarSkin(geometry,{x:0,y:0,z:.82,radius:.1}),2);
 const color=geometry.attributes.color;assert.ok(color.getX(0)<color.getX(1));assert.ok(color.getX(1)<.8);assert.ok(Math.abs(color.getX(2)-.8)<1e-6);assert.deepEqual(geometry.attributes.position.array,before);
});
