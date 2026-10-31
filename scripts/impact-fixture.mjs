import {readFileSync} from "node:fs";
import {BufferGeometry,Float32BufferAttribute,InstancedBufferAttribute,InstancedMesh,MeshStandardMaterial,SphereGeometry,Object3D,Vector3,Color,SRGBColorSpace} from "three";
import {createHexagonalEarthGeometry} from "../components/three/planet/hexagonal-earth-geometry.mjs";
import {createLunarFacetGeometry} from "../components/three/moon/lunar-facet-geometry.mjs";
import {createDestructible} from "../components/three/ufo/projectile-collision.mjs";
export function impactFixture(kind){
 const data=JSON.parse(readFileSync(new URL(`../public/models/${kind}/block-${kind}.json`,import.meta.url))),moon=kind==="moon";
 const geometry=moon?createLunarFacetGeometry(data):createHexagonalEarthGeometry(),material=new MeshStandardMaterial(),mesh=new InstancedMesh(geometry,material,data.sizes.length),transform=new Object3D(),normal=new Vector3(),up=new Vector3(0,1,0),color=new Color();
 geometry.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(data.sizes.length),1));
 for(let i=0;i<data.sizes.length;i++){
  transform.position.fromArray(data.positions,i*3);transform.quaternion.setFromUnitVectors(up,normal.fromArray(data.normals,i*3).normalize());const width=data.sizes[i]*(moon?data.tileTangentScale:1.4),depth=data.sizes[i]*(moon?data.tileDepthScale:1.15);transform.scale.set(width,depth,width);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);color.setRGB(...data.colors.slice(i*3,i*3+3),SRGBColorSpace);mesh.setColorAt(i,color);
 }
 const core=new SphereGeometry(moon?data.foundation:2.94,64,40),skin=moon?new BufferGeometry():null;
 if(skin){skin.setAttribute("position",new Float32BufferAttribute(data.skin.positions,3));skin.setIndex(data.skin.indices);skin.computeVertexNormals();}
 mesh.updateMatrixWorld(true);const dead=new Set(),target=createDestructible(mesh,dead,{mode:"crater",foundation:moon?data.foundation:2.94,blast:moon?.14:.3,padding:moon?.012:.025,threshold:moon?12:60,craterSurfaces:{current:[core,skin]}});
 return {data,mesh,core,skin,target,dead,dispose(){mesh.dispose();geometry.dispose();material.dispose();core.dispose();skin?.dispose();}};
}
